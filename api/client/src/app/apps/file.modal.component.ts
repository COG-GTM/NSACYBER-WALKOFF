import { Component, Input, inject, viewChild } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgForm, FormsModule } from '@angular/forms';
import { UtilitiesService } from '../utilities.service';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap/tooltip';

@Component({
    selector: 'file-modal-component',
    templateUrl: './file.modal.html',
    imports: [FormsModule, NgbTooltip]
})
export class FileModalComponent {
    activeModal = inject(NgbActiveModal);
    utils = inject(UtilitiesService);

    readonly myForm = viewChild<NgForm>('myForm');
    path: string;
    submitted: boolean = false;
    importFile: File;

    /**
	 * Sets our playbook to import based on a file input change.
	 * @param event JS Event for the playbook file input
	 */
	onImportSelectChange(event: Event) {
        this.importFile = (event.srcElement || event.target  as any).files[0];
        console.log(this.importFile)
	}
    
    async submit() {
        this.submitted = true;
        if (this.importFile) {
            const body = await this.utils.readUploadedFileAsText(this.importFile);
            this.activeModal.close({ path: this.importFile.name, body});
        }
    }
}