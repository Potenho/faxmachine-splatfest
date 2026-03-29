import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { LangSelector } from '../../../../common/components/lang-selector/lang-selector';
import { EditorService } from '../../../../services/splatfest/editor';
import { Languages } from '../../../../services/splatfest/types/languages';
import { IdolEmotions, Idols } from '../../../../services/splatfest/types/idols';
import { AnyNewsCommands, SpeakRawTextCommand, ChangeAnimationCommand, SpeakMsgLabelCommand, DispFestCommand, DispPictureCommand, DispMapCommand, ShowHeaderCommand } from '../../../../services/splatfest/types/news-commands';
import { NewsSections } from '../../../../services/splatfest/types/news-sectios';
import { DispFestOptions, HeaderTypes, PictureTypes } from '../../../../services/splatfest/types/news-params';
import { NoOptionsEditor } from './command-editors/no-options/no-options-editor';
import { SpeakRawTextEditor } from './command-editors/speak-raw-text/speak-raw-text-editor';
import { ChangeAnimationEditor } from './command-editors/change-animation/change-animation-editor';
import { SpeakMsgLabelEditor } from './command-editors/speak-msg-label/speak-msg-label-editor';
import { DispFestEditor } from './command-editors/disp-fest/disp-fest-editor';
import { DispPictureEditor } from './command-editors/disp-picture/disp-picture-editor';
import { DispMapEditor } from './command-editors/disp-map/disp-map-editor';
import { ShowHeaderEditor } from './command-editors/show-header/show-header-editor';

const NO_OPTIONS_COMMANDS = new Set<AnyNewsCommands['Command']>([
  'ClearMsg', 'WaitTelop', 'CatchIn', 'CatchOut',
  'TitleIn', 'TitleOut', 'DispDefault', 'DispFixGame',
]);

const COMMAND_TYPES: AnyNewsCommands['Command'][] = [
  'SpeakRawText', 'ChangeAnimation', 'SpeakMsgLabel',
  'ClearMsg', 'WaitTelop',
  'CatchIn', 'CatchOut', 'TitleIn', 'TitleOut',
  'DispDefault', 'DispFest', 'DispFixGame', 'DispPicture', 'DispMap',
  'ShowHeader',
];

const COMMAND_DEFAULTS: Record<string, AnyNewsCommands> = {
  SpeakRawText:    { Command: 'SpeakRawText', Speaker: Idols.Callie, Emotion: IdolEmotions.NormalTalk, Text: '', WaitButton: false },
  ChangeAnimation: { Command: 'ChangeAnimation', Speaker: Idols.Callie, Emotion: IdolEmotions.NormalTalk },
  SpeakMsgLabel:   { Command: 'SpeakMsgLabel', Label: '' },
  ClearMsg:        { Command: 'ClearMsg' },
  WaitTelop:       { Command: 'WaitTelop' },
  CatchIn:         { Command: 'CatchIn' },
  CatchOut:        { Command: 'CatchOut' },
  TitleIn:         { Command: 'TitleIn' },
  TitleOut:        { Command: 'TitleOut' },
  DispDefault:     { Command: 'DispDefault' },
  DispFest:        { Command: 'DispFest', Kind: DispFestOptions.Fest },
  DispFixGame:     { Command: 'DispFixGame' },
  DispPicture:     { Command: 'DispPicture', Picture: PictureTypes.FirstNewsUFO },
  DispMap:         { Command: 'DispMap', MapId: 0 },
  ShowHeader:      { Command: 'ShowHeader', Type: HeaderTypes.None },
};

@Component({
  selector: 'app-news-script',
  imports: [
    TranslocoPipe, ReactiveFormsModule, LangSelector,
    NoOptionsEditor, SpeakRawTextEditor, ChangeAnimationEditor,
    SpeakMsgLabelEditor, DispFestEditor, DispPictureEditor,
    DispMapEditor, ShowHeaderEditor,
  ],
  templateUrl: './news-script.html',
  styleUrl: './news-script.scss',
})
export class NewsScript {
  readonly #editorService = inject(EditorService);

  readonly NewsSections = NewsSections;
  readonly sections = Object.values(NewsSections);
  readonly languages = Object.values(Languages);
  readonly commandTypes = COMMAND_TYPES;

  protected readonly commandList = viewChild.required<ElementRef<HTMLUListElement>>('commandList');
  protected readonly syncDialog = viewChild.required<ElementRef<HTMLDialogElement>>('syncDialog');

  readonly activeSection = signal<NewsSections>(NewsSections.Announce);
  readonly activeLanguage = signal<Languages>(Languages.USen);
  readonly selectedIndex = signal<number | null>(null);
  readonly selectionVersion = signal(0);
  readonly syncTarget = signal<Languages | '__all__'>('__all__');

  readonly activeCommands = computed<AnyNewsCommands[]>(() => {
    const script = this.#editorService.festNewsScript();
    if (!script) return [];
    const section = script.News.find(n => n.NewsType === this.activeSection());
    if (!section) return [];
    return section[this.activeLanguage()] ?? [];
  });

  readonly selectedCommand = computed<AnyNewsCommands | null>(() => {
    const i = this.selectedIndex();
    return i !== null ? (this.activeCommands()[i] ?? null) : null;
  });

  selectSection(section: NewsSections): void {
    this.activeSection.set(section);
    this.selectedIndex.set(null);
  }

  selectLanguage(lang: Languages): void {
    this.activeLanguage.set(lang);
    this.selectedIndex.set(null);
  }

  selectCommand(index: number, event: MouseEvent): void {
    if ((event.target as Element).closest('.ns__command-action-btn')) return;
    this.selectedIndex.set(index === this.selectedIndex() ? null : index);
    this.selectionVersion.update(v => v + 1);
  }

  changeCommandType(type: string): void {
    const i = this.selectedIndex();
    if (i === null) return;
    const newCmd = COMMAND_DEFAULTS[type] ?? { Command: type } as AnyNewsCommands;
    this.#editorService.updateCommand(this.activeSection(), this.activeLanguage(), i, newCmd);
  }

  onCommandChange(cmd: AnyNewsCommands): void {
    const i = this.selectedIndex();
    if (i === null) return;
    this.#editorService.updateCommand(this.activeSection(), this.activeLanguage(), i, cmd);
  }

  addCommand(): void {
    const newIndex = this.activeCommands().length;
    this.#editorService.addCommand(this.activeSection(), this.activeLanguage(), COMMAND_DEFAULTS['SpeakRawText']);
    this.selectedIndex.set(newIndex);
    setTimeout(() => {
      this.commandList().nativeElement.scrollTo({ top: this.commandList().nativeElement.scrollHeight, behavior: 'smooth' });
    });
  }

  duplicateCommand(index: number): void {
    this.#editorService.duplicateCommand(this.activeSection(), this.activeLanguage(), index);
    this.selectedIndex.set(index + 1);
  }

  deleteCommand(index: number): void {
    this.#editorService.deleteCommand(this.activeSection(), this.activeLanguage(), index);
    const selected = this.selectedIndex();
    if (selected === null) return;
    if (selected === index) {
      this.selectedIndex.set(null);
    } else if (selected > index) {
      this.selectedIndex.set(selected - 1);
    }
  }

  openSyncModal(): void {
    const otherLang = this.languages.find(l => l !== this.activeLanguage());
    if (otherLang && this.syncTarget() !== '__all__' && this.syncTarget() === this.activeLanguage()) {
      this.syncTarget.set(otherLang);
    }
    this.syncDialog().nativeElement.showModal();
  }

  closeSyncModal(): void {
    this.syncDialog().nativeElement.close();
  }

  applySyncCopy(): void {
    const target = this.syncTarget();
    if (target === '__all__') {
      this.#editorService.copyLanguageToAll(this.activeSection(), this.activeLanguage());
    } else {
      this.#editorService.copyLanguage(this.activeSection(), this.activeLanguage(), target);
    }
    this.closeSyncModal();
  }

  onSyncDialogClick(event: MouseEvent): void {
    if (event.target === this.syncDialog().nativeElement) {
      this.closeSyncModal();
    }
  }

// Type cast helpers for @switch narrowing in template
  asSpeakRawText    = (c: AnyNewsCommands) => c as SpeakRawTextCommand;
  asChangeAnimation = (c: AnyNewsCommands) => c as ChangeAnimationCommand;
  asSpeakMsgLabel   = (c: AnyNewsCommands) => c as SpeakMsgLabelCommand;
  asDispFest        = (c: AnyNewsCommands) => c as DispFestCommand;
  asDispPicture     = (c: AnyNewsCommands) => c as DispPictureCommand;
  asDispMap         = (c: AnyNewsCommands) => c as DispMapCommand;
  asShowHeader      = (c: AnyNewsCommands) => c as ShowHeaderCommand;

  commandLabel(cmd: AnyNewsCommands): string {
    if (cmd.Command === 'SpeakRawText') {
      const speak = cmd as SpeakRawTextCommand;
      const name = speak.Speaker === Idols.Callie ? 'Callie' : 'Marie';
      return `${name}: ${speak.Text}`;
    }
    return cmd.Command;
  }

  isSpeakRawText(cmd: AnyNewsCommands): cmd is SpeakRawTextCommand {
    return cmd.Command === 'SpeakRawText';
  }

  isNoOptions(cmd: AnyNewsCommands): boolean {
    return NO_OPTIONS_COMMANDS.has(cmd.Command);
  }

  noOptionsI18nKey(cmd: AnyNewsCommands): string {
    return `editor.newsScript.commandEditor.commandTypes.${cmd.Command}`;
  }

  speakerLabel(cmd: SpeakRawTextCommand): string {
    const map: Record<'callie' | 'marie' | 'all' | 'invalid', string> = {
      callie: 'Callie', marie: 'Marie', all: 'Callie & Marie', invalid: '?',
    };
    return map[this.speakerOf(cmd)];
  }

  speakerOf(cmd: SpeakRawTextCommand): 'callie' | 'marie' | 'all' | 'invalid' {
    switch (cmd.Speaker) {
      case Idols.Callie: return 'callie';
      case Idols.Marie:  return 'marie';
      case Idols.All:    return 'all';
      default:           return 'invalid';
    }
  }

  emotionLabel(emotion: IdolEmotions): string {
    const map: Record<IdolEmotions, string> = {
      [IdolEmotions.Greeting]: 'Greeting', [IdolEmotions.Surprised]: 'Surprised',
      [IdolEmotions.Happy]: 'Happy',       [IdolEmotions.NormalTalk]: 'Normal',
      [IdolEmotions.Feed]: 'Feed',         [IdolEmotions.Angry]: 'Angry',
      [IdolEmotions.Bored]: 'Bored',       [IdolEmotions.Wait]: 'Wait',
    };
    return map[emotion] ?? emotion;
  }

  sectionI18nKey(section: NewsSections): string {
    const map: Record<NewsSections, string> = {
      [NewsSections.Announce]: 'editor.newsScript.sections.announce',
      [NewsSections.Start]:    'editor.newsScript.sections.start',
      [NewsSections.ResultA]:  'editor.newsScript.sections.resultA',
      [NewsSections.ResultB]:  'editor.newsScript.sections.resultB',
    };
    return map[section];
  }
}
