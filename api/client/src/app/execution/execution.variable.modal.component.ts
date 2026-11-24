import { Component, Input, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Workflow } from '../models/playbook/workflow';
import { EnvironmentVariable } from '../models/playbook/environmentVariable';

@Component({
    selector: 'execution-variable-modal-component',
    templateUrl: './execution.variable.modal.html',
    imports: [FormsModule]
})
export class ExecutionVariableModalComponent {
    activeModal = inject(NgbActiveModal);

    @Input() workflow: Workflow;

    execute(form: NgForm) : void {
        let variables: EnvironmentVariable[] = [];
        this.workflow.referenced_variables.forEach(variable => {
            if (form.value[variable.id] && form.value[variable.id] != '') {
                let newV = new EnvironmentVariable();
                newV.id = variable.id;
                newV.name = variable.name;
                newV.value = form.value[variable.id];
                variables.push(newV);
            }
        })
        this.activeModal.close(variables);
    }
}