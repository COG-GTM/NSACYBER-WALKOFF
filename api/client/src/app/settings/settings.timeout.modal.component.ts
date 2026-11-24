import { Component, Input, inject } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

import { SettingsService } from './settings.service';
import { UtilitiesService } from '../utilities.service';

import { WorkingUser } from '../models/workingUser';
import { Configuration } from '../models/configuration';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'timeout-modal',
    templateUrl: './settings.timeout.modal.html',
    styleUrls: [
        './settings.scss',
    ],
    providers: [SettingsService, UtilitiesService],
    imports: [FormsModule]
})
export class SettingsTimeoutModalComponent {
	activeModal = inject(NgbActiveModal);

	@Input() configuration: Configuration;
}
