import { Directive, ElementRef, EventEmitter, HostListener, Injectable, Input, NgModule, Output } from '@angular/core';

/**
 * Minimal in-app replacement for the abandoned ng2-dnd package (no Ivy build): HTML5 drag and drop
 * with the same selectors, inputs, outputs, event payload ({ dragData, mouseEvent }) and CSS classes.
 */
export interface DragDropData { dragData: any; mouseEvent: DragEvent; }

@Injectable({ providedIn: 'root' })
export class DragDropService {
	isDragged = false;
	dragData: any;
}

@Directive({
    selector: '[dnd-draggable]',
    standalone: false
})
export class DraggableDirective {
	@Input() dragData: any;
	@Input() set dragEnabled(enabled: boolean) { this.el.nativeElement.draggable = !!enabled; }
	@Output() onDragStart = new EventEmitter<DragDropData>();
	@Output() onDragEnd = new EventEmitter<DragDropData>();

	constructor(private el: ElementRef<HTMLElement>, private dnd: DragDropService) {
		el.nativeElement.draggable = true;
	}

	@HostListener('dragstart', ['$event'])
	dragStart(event: DragEvent) {
		this.dnd.isDragged = true;
		this.dnd.dragData = this.dragData;
		if (event.dataTransfer) {
			event.dataTransfer.setData('text', '');
			event.dataTransfer.effectAllowed = 'move';
		}
		this.el.nativeElement.classList.add('dnd-drag-start');
		this.onDragStart.emit({ dragData: this.dragData, mouseEvent: event });
	}

	@HostListener('dragend', ['$event'])
	dragEnd(event: DragEvent) {
		this.dnd.isDragged = false;
		this.el.nativeElement.classList.remove('dnd-drag-start');
		this.onDragEnd.emit({ dragData: this.dragData, mouseEvent: event });
	}
}

@Directive({
    selector: '[dnd-droppable]',
    standalone: false
})
export class DroppableDirective {
	@Input() dropEnabled = true;
	@Output() onDropSuccess = new EventEmitter<DragDropData>();

	constructor(private el: ElementRef<HTMLElement>, private dnd: DragDropService) {}

	private get active() { return this.dropEnabled && this.dnd.isDragged; }

	@HostListener('dragenter')
	dragEnter() { if (this.active) { this.el.nativeElement.classList.add('dnd-drag-enter'); } }

	@HostListener('dragover', ['$event'])
	dragOver(event: DragEvent) {
		if (!this.active) { return; }
		event.preventDefault();
		if (event.dataTransfer) { event.dataTransfer.dropEffect = 'move'; }
		this.el.nativeElement.classList.add('dnd-drag-over');
	}

	@HostListener('dragleave')
	dragLeave() { this.clear(); }

	@HostListener('drop', ['$event'])
	drop(event: DragEvent) {
		this.clear();
		if (!this.active) { return; }
		event.preventDefault();
		this.dnd.isDragged = false;
		this.onDropSuccess.emit({ dragData: this.dnd.dragData, mouseEvent: event });
	}

	private clear() { this.el.nativeElement.classList.remove('dnd-drag-enter', 'dnd-drag-over'); }
}

@NgModule({
	declarations: [DraggableDirective, DroppableDirective],
	exports: [DraggableDirective, DroppableDirective],
})
export class DndModule {}
