import { inject, Injectable } from "@angular/core";
import { Byaml } from "../byaml/byaml-parser";
import { InvalidBymlError } from "../byaml/types/errors";
import { HttpClient } from "@angular/common/http";
import { lastValueFrom } from "rxjs";
import { SplatfestModel } from "./types/splatfest-model";
import { Languages } from "./types/languages";

@Injectable({
  providedIn: 'root'
})
export class SplatfestFileService {
  #byml = inject(Byaml);
  #httpClient = inject(HttpClient);

  async parseSplatfestFile(file: File) {
    const splatfestModel = await this.#byml.readFromBlob<SplatfestModel>(file);
    this.#checkSplatfestModel(splatfestModel)

    return splatfestModel;
  }

  writeSplatfestFile(model: SplatfestModel): Uint8Array {
    return this.#byml.write(model);
  }

  async getTemplateFile() {
    const template = await lastValueFrom(
      this.#httpClient.get('templates/template.byaml', { responseType: 'blob' })
    );
  
    const splatfestModel = await this.#byml.read<SplatfestModel>(await template.arrayBuffer());
    this.#checkSplatfestModel(splatfestModel)

    return splatfestModel;
  }

  #checkSplatfestModel(model: Record<string, any>): model is SplatfestModel {
    if (typeof model !== 'object' || model === null) return false;

    const validators: ((model: Record<string, any>) => boolean)[] = [
      this.#validateGeneralSettings,
      this.#validateTimeSettings,
      this.#validateStages,
      this.#validateNews,
      this.#validateTeams,
    ];

    for (const validator of validators) {
      if (!validator(model))
        throw new InvalidBymlError(
          'The provided BYAML file is not a valid Splatfest model.'
        );
    }

    return true;
  }

  #validateGeneralSettings(model: Record<string, any>): boolean {
    const conditions = [
      typeof model['FestivalId'] === 'number',
      typeof model['BattleResultRate'] === 'number',
      typeof model['SeparateMatchingJP'] === 'boolean',
      typeof model['LowPopulationNotJP'] === 'boolean',
      typeof model['Version'] === 'number',
      typeof model['Rule'] === 'string',
      typeof model['Version'] === 'number',
    ];

    if (conditions.some(c => !c)) return false;

    if (
      model['HideTeamNamesOnBoard']
      && typeof model['HideTeamNamesOnBoard'] !== 'boolean'
    ) return false;

    return true;
  }

  #validateTimeSettings(model: Record<string, any>): boolean {
    const conditions = [
      typeof model['Time'] === 'object',
      model['Time'] !== null,
      typeof model['Time']['Announce'] === 'string',
      typeof model['Time']['Start'] === 'string',
      typeof model['Time']['End'] === 'string',
      typeof model['Time']['Result'] === 'string',
    ];

    if (conditions.some(c => !c)) return false;

    for (const key of ['Announce', 'Start', 'End', 'Result']) {
      if (isNaN(Date.parse(model['Time'][key]))) return false;
    }

    return true;
  }

  #validateStages(model: Record<string, any>): boolean {
    if (!Array.isArray(model['Stages'])) return false;
    if (model['Stages'].length === 0) return false;

    for (const stageEntry of model['Stages']) {
      if (typeof stageEntry !== 'object' || stageEntry === null) return false;
      if (typeof stageEntry['MapID'] !== 'number') return false;
    }

    return true;
  }

  #validateNews(model: Record<string, any>): boolean {
    if (!Array.isArray(model['News'])) return false;
    if (model['News'].length !== 4) return false;

    for (const newsEntry of model['News']) {
      if (typeof newsEntry !== 'object' || newsEntry === null) return false;
      if (typeof newsEntry['NewsType'] !== 'string') return false;
      for (const language of Object.values(Languages)) {
        if (!(language in newsEntry)) return false;
        if (!Array.isArray(newsEntry[language])) return false;

        for (const command of newsEntry[language]) {
          if (typeof command !== 'object' || command === null) return false;
          if (typeof command['Command'] !== 'string') return false;
        }

      }
    }

    return true;
  }

  #validateTeams(model: Record<string, any>): boolean {
    if (typeof model['Teams'] !== 'object' || model['Teams'] === null) return false;
    if (!Array.isArray(model['Teams'])) return false;
    if (model['Teams'].length < 2) return false;

    for (let i = 0; i < model['Teams'].length; i++) {
      const teamEntry = model['Teams'][i];
      if (typeof teamEntry !== 'object' || teamEntry === null) return false;
      if (typeof teamEntry['Color'] !== 'string') return false;

      if (i === 2) continue;

      if (typeof teamEntry['Name'] !== 'object' || teamEntry['Name'] === null) return false;
      if (typeof teamEntry['ShortName'] !== 'object' || teamEntry['ShortName'] === null) return false;

      for (const language of Object.values(Languages)) {
        if (typeof teamEntry['Name'][language] !== 'string') return false;
        if (typeof teamEntry['ShortName'][language] !== 'string') return false;
      }
    }

    return true;
  }
}