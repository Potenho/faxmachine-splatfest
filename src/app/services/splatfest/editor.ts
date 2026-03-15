import { computed, inject, Injectable, signal } from "@angular/core";
import { SplatfestFileService } from "./splatfest-file";
import { SplatfestEtcParams, SplatfestModel, SplatfestNewsScript, SplatfestRotation, SplatfestTeams, SplatfestTime } from "./types/splatfest-model";
import { Languages } from "./types/languages";

@Injectable({
  providedIn: 'root'
})
export class EditorService {
  #splatfestFile = inject(SplatfestFileService);

  language = signal<Languages>(Languages.USen);

  festTeams = signal<SplatfestTeams | null>(null);
  festTime = signal<SplatfestTime | null>(null);
  festRotation = signal<SplatfestRotation | null>(null);
  festNewsScript = signal<SplatfestNewsScript | null>(null);
  festEtcParams = signal<SplatfestEtcParams | null>(null);

  splatfestModel = computed<SplatfestModel | null>(() => this.#mergeSplatfestModel());
  isEditing = computed(() => !!this.splatfestModel());

  async initializeFromFile(file: File) {
    const splatfestModel = await this.#splatfestFile.parseSplatfestFile(file);
    this.#setSplatfestParts(splatfestModel);
  }

  async initializeFromTemplate() {
    const splatfestModel = await this.#splatfestFile.getTemplateFile();
    this.#setSplatfestParts(splatfestModel);
  }

  closeEditor() {
    this.festTeams.set(null);
    this.festTime.set(null);
    this.festRotation.set(null);
    this.festNewsScript.set(null);
    this.festEtcParams.set(null);
  }

  downloadSplatfestFile() {
    const model = this.splatfestModel();

    if (!model) {
      throw new Error('No splatfest model to download.');
    }

    const byamlData = this.#splatfestFile.writeSplatfestFile(model);
    const blob = new Blob(
      [new Uint8Array(byamlData)],
      { 
        type: "application/octet-stream"
      }
    );
    const url = URL.createObjectURL(blob);

    const downloadBtn = document.createElement('a');
    downloadBtn.href = url;
    downloadBtn.download = '00000544';
    downloadBtn.click();

    window.URL.revokeObjectURL(url);
  }

  #setSplatfestParts(model: SplatfestModel) {
    this.festTeams.set({
      Teams: model.Teams
    });

    this.festTime.set({
      Time: model.Time,
    });

    this.festRotation.set({
      Rule: model.Rule,
      Stages: model.Stages,
    });

    this.festNewsScript.set({
      News: model.News,
    });

    this.festEtcParams.set({
      FestivalId: model.FestivalId,
      BattleResultRate: model.BattleResultRate,
      SeparateMatchingJP: model.SeparateMatchingJP,
      LowPopulationNotJP: model.LowPopulationNotJP,
      HideTeamNamesOnBoard: model.HideTeamNamesOnBoard ?? false,
      Version: model.Version,
    });
  }

  #mergeSplatfestModel(): SplatfestModel | null {
    const festTeams = this.festTeams();
    const festTime = this.festTime();
    const festRotation = this.festRotation();
    const festNewsScript = this.festNewsScript();
    const festEtcParams = this.festEtcParams();

    const allParts = [
      festTeams,
      festTime,
      festRotation,
      festNewsScript,
      festEtcParams
    ] as const;

    for (const part of allParts) {
      if (!part) return null;
    }

    return {
      News: festNewsScript!.News,
      Teams: festTeams!.Teams,
      Time: festTime!.Time,
      Rule: festRotation!.Rule,
      Stages: festRotation!.Stages,
      ...festEtcParams!
    }
  }
}