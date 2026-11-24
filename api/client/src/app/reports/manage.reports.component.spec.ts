import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrModule } from 'ngx-toastr';

import { ManageReportsComponent } from './manage.reports.component';
import { SafeEmbedPipe } from '../pipes/safeEmbed.pipe';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ManageReportsComponent', () => {
  let component: ManageReportsComponent;
  let fixture: ComponentFixture<ManageReportsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [ManageReportsComponent, SafeEmbedPipe],
    schemas: [NO_ERRORS_SCHEMA],
    imports: [FormsModule, RouterTestingModule, NgbModule, ToastrModule.forRoot()],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
