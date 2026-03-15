import { IdolEmotions, Idols } from "./idols";
import { DispFestOptions, HeaderTypes, PictureTypes } from "./news-params";

export type AnyNewsCommands =
  SpeakRawTextCommand |
  ChangeAnimationCommand |
  SpeakMsgLabelCommand |
  CatchInCommand |
  CatchOutCommand |
  TitleIn |
  TitleOut |
  DispDefaultCommand |
  DispFestCommand |
  DispFixGameCommand |
  DispPictureCommand |
  DispMapCommand |
  ShowHeaderCommand |
  ClearMsgCommand |
  WaitTelopCommand |
  CustomCommand;


export interface CommandCommon<T> {
  Command: T;
}

export interface SpeakerAndEmotion {
  Emotion: IdolEmotions;
  Speaker: Idols;
}

export interface OptionalSkip {
  Skip?: boolean
}

export interface CommandType<T> {
  Type: T;
}

export interface CommandKind<T> {
  Kind: T;
}


// IDOL COMMANDS

export interface SpeakRawTextCommand extends CommandCommon<'SpeakRawText'>, SpeakerAndEmotion, OptionalSkip {
  Text: string;
  WaitButton: boolean;
}

export interface ChangeAnimationCommand extends CommandCommon<'ChangeAnimation'>, SpeakerAndEmotion { }

export interface SpeakMsgLabelCommand extends CommandCommon<'SpeakMsgLabel'>, OptionalSkip {
  Label: string;
}

export type ClearMsgCommand = CommandCommon<'ClearMsg'>

export type WaitTelopCommand = CommandCommon<'WaitTelop'>


// NEWS TRANSITION COMMANDS

export type CatchInCommand = CommandCommon<'CatchIn'>

export type CatchOutCommand = CommandCommon<'CatchOut'>

export type TitleIn = CommandCommon<'TitleIn'>

export type TitleOut = CommandCommon<'TitleOut'>


// NEWS PANEL COMMANNDS

export type DispDefaultCommand = CommandCommon<'DispDefault'>

export interface DispFestCommand extends CommandCommon<'DispFest'>, CommandKind<DispFestOptions> { }

export type DispFixGameCommand = CommandCommon<'DispFixGame'>

export interface DispPictureCommand extends CommandCommon<'DispPicture'> {
  Picture: PictureTypes;
}

export interface DispMapCommand extends CommandCommon<'DispMap'> {
  MapId: number;
}

// NEWS HEADER COMMANDS

export interface ShowHeaderCommand extends CommandCommon<'ShowHeader'>, CommandType<HeaderTypes> { }



// CUSTOM

export interface CustomCommand extends CommandCommon<'string'>, Record<string, boolean | string | number> { };