import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { getTranslocoModule } from '../../../../../../testing/transloco-testing.module';
import { EditorService } from '../../../../../../services/splatfest/editor';
import { MatchmakingCategory } from './matchmaking-category';

const mockEtcParams = {
  FestivalId: 1,
  BattleResultRate: 1,
  SeparateMatchingJP: false,
  LowPopulationNotJP: true,
  HideTeamNamesOnBoard: false,
  Version: 1,
};

describe('MatchmakingCategory', () => {
  let fixture: ComponentFixture<MatchmakingCategory>;
  let component: MatchmakingCategory;
  let editorServiceSpy: jasmine.SpyObj<EditorService> & { festEtcParams: ReturnType<typeof signal> };

  beforeEach(async () => {
    const festEtcParamsSignal = signal<typeof mockEtcParams | null>(mockEtcParams);
    const spy = jasmine.createSpyObj('EditorService', [], {
      festEtcParams: festEtcParamsSignal,
    });

    await TestBed.configureTestingModule({
      imports: [MatchmakingCategory, getTranslocoModule()],
      providers: [{ provide: EditorService, useValue: spy }],
    }).compileComponents();

    editorServiceSpy = TestBed.inject(EditorService) as typeof editorServiceSpy;
    fixture = TestBed.createComponent(MatchmakingCategory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should patch form from service on init', () => {
    expect(component.form.controls.SeparateMatchingJP.value).toBeFalse();
    expect(component.form.controls.LowPopulationNotJP.value).toBeTrue();
  });

  it('should update service when form changes', () => {
    component.form.controls.SeparateMatchingJP.setValue(true);
    const updated = editorServiceSpy.festEtcParams();
    expect(updated?.SeparateMatchingJP).toBeTrue();
  });
});
