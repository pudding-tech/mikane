import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MessageService } from 'src/app/services/message/message.service';
import { UserService } from 'src/app/services/user/user.service';
import { User } from 'src/app/services/user/user.service';
import { PreferencesComponent } from './preferences.component';

describe('PreferencesComponent', () => {
  let component: PreferencesComponent;
  let fixture: ComponentFixture<PreferencesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        MatCardModule,
        MatIconModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatProgressSpinnerModule,
        BrowserAnimationsModule,
      ],
      providers: [
        { provide: UserService, useValue: {} },
        { provide: MessageService, useValue: {} },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreferencesComponent);
    component = fixture.componentInstance;
    component.user = {
      id: '1',
      publicEmail: false,
      publicPhone: true,
    } as User;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize publicEmail and publicPhone from user', () => {
    expect(component.user.publicEmail).toEqual(false);
    expect(component.user.publicPhone).toEqual(true);
  });
});
