import { Component, Input, ViewEncapsulation, OnInit, OnDestroy, ElementRef, inject, viewChild } from '@angular/core';

import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../auth/auth.service';
import { UtilitiesService } from '../utilities.service';
import { DatatableComponent, DataTableColumnDirective, DataTableColumnCellDirective } from '@swimlane/ngx-datatable';
import { WorkflowStatus } from '../models/execution/workflowStatus';
import { NodeStatuses } from '../models/execution/nodeStatus';
import { JsonModalComponent } from './json.modal.component';
import { ClipboardModule } from 'ngx-clipboard';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap/tooltip';
import { MomentModule } from 'ngx-moment';

@Component({
    selector: 'results-modal-component',
    templateUrl: './results.modal.html',
    styleUrls: [
        './results.modal.scss',
    ],
    encapsulation: ViewEncapsulation.None,
    imports: [DatatableComponent, DataTableColumnDirective, DataTableColumnCellDirective, ClipboardModule, NgbTooltip, MomentModule]
})
export class ResultsModalComponent implements OnInit, OnDestroy {
    activeModal = inject(NgbActiveModal);
    utils = inject(UtilitiesService);
    toastrService = inject(ToastrService);
    authService = inject(AuthService);
    modalService = inject(NgbModal);

    @Input() loadedWorkflowStatus: WorkflowStatus;
    readonly nodeStatusContainer = viewChild<ElementRef>('nodeStatusContainer');
    readonly nodeStatusTable = viewChild<DatatableComponent>('nodeStatusTable');
    NodeStatuses = NodeStatuses;

    editorOptionsData: any = {
		mode: 'code',
		modes: ['code', 'view'],
		history: false,
		search: false,
		// mainMenuBar: false,
		navigationBar: false,
		statusBar: false,
		enableSort: false,
        enableTransform: false,
        onEditable: () => false
	}

    ngOnInit(): void {}

    ngOnDestroy(): void {}

    resultsModal(results) {
		const modalRef = this.modalService.open(JsonModalComponent, { size: 'lg', centered: true });
		modalRef.componentInstance.results = results;
		return false;
	}
}