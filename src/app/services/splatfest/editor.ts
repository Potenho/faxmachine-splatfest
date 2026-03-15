import { computed, inject, Injectable, signal } from "@angular/core";
import { SplatfestFileService } from "./splatfest-file";
import { SplatfestEtcParams, SplatfestModel, SplatfestNewsScript, SplatfestRotation, SplatfestTeams, SplatfestTime } from "./types/splatfest-model";
import { Languages } from "./types/languages";
import { AnyNewsCommands } from "./types/news-commands";
import { NewsSections } from "./types/news-sectios";

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

  updateCommand(section: NewsSections, language: Languages, index: number, command: AnyNewsCommands): void {
    this.festNewsScript.update(current => {
      if (!current) return current;
      const updatedNews = current.News.map(newsSection => {
        if (newsSection.NewsType !== section) return newsSection;
        const commands = [...newsSection[language]];
        commands[index] = command;
        return { ...newsSection, [language]: commands };
      }) as SplatfestNewsScript['News'];
      return { News: updatedNews };
    });
  }

  addCommand(section: NewsSections, language: Languages, command: AnyNewsCommands): void {
    this.festNewsScript.update(current => {
      if (!current) return current;
      const updatedNews = current.News.map(newsSection => {
        if (newsSection.NewsType !== section) return newsSection;
        const commands = [...(newsSection[language] ?? []), command];
        return { ...newsSection, [language]: commands };
      }) as SplatfestNewsScript['News'];
      return { News: updatedNews };
    });
  }

  duplicateCommand(section: NewsSections, language: Languages, index: number): void {
    this.festNewsScript.update(current => {
      if (!current) return current;
      const updatedNews = current.News.map(newsSection => {
        if (newsSection.NewsType !== section) return newsSection;
        const commands = [...newsSection[language]];
        commands.splice(index + 1, 0, { ...commands[index] });
        return { ...newsSection, [language]: commands };
      }) as SplatfestNewsScript['News'];
      return { News: updatedNews };
    });
  }

  deleteCommand(section: NewsSections, language: Languages, index: number): void {
    this.festNewsScript.update(current => {
      if (!current) return current;
      const updatedNews = current.News.map(newsSection => {
        if (newsSection.NewsType !== section) return newsSection;
        const commands = [...newsSection[language]];
        commands.splice(index, 1);
        return { ...newsSection, [language]: commands };
      }) as SplatfestNewsScript['News'];
      return { News: updatedNews };
    });
  }

  copyLanguage(section: NewsSections, source: Languages, target: Languages): void {
    this.festNewsScript.update(current => {
      if (!current) return current;
      const sourceSection = current.News.find(n => n.NewsType === section);
      if (!sourceSection) return current;
      const commands = (sourceSection[source] ?? []).map(c => ({ ...c }));
      const updatedNews = current.News.map(newsSection => {
        if (newsSection.NewsType !== section) return newsSection;
        return { ...newsSection, [target]: commands };
      }) as SplatfestNewsScript['News'];
      return { News: updatedNews };
    });
  }

  copyLanguageToAll(section: NewsSections, source: Languages): void {
    this.festNewsScript.update(current => {
      if (!current) return current;
      const sourceSection = current.News.find(n => n.NewsType === section);
      if (!sourceSection) return current;
      const sourceCommands = (sourceSection[source] ?? []).map(c => ({ ...c }));
      const updatedNews = current.News.map(newsSection => {
        if (newsSection.NewsType !== section) return newsSection;
        const overrides = Object.fromEntries(
          Object.values(Languages)
            .filter(lang => lang !== source)
            .map(lang => [lang, sourceCommands.map(c => ({ ...c }))])
        );
        return { ...newsSection, ...overrides };
      }) as SplatfestNewsScript['News'];
      return { News: updatedNews };
    });
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