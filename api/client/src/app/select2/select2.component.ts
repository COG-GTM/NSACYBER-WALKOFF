import {
	AfterViewInit, Component, ElementRef, EventEmitter, Input, NgModule, OnChanges, OnDestroy, Output,
	Renderer2, SimpleChanges, ViewChild,
} from '@angular/core';

declare const jQuery: any;

export interface Select2OptionData {
	id: string;
	text: string;
	disabled?: boolean;
	children?: Array<Select2OptionData>;
	additional?: any;
}

/**
 * In-app port of the abandoned ng2-select2 component (no Ivy build, uses the removed Renderer API).
 * Same selector, inputs and valueChanged payload; wraps the global jQuery select2 plugin.
 */
@Component({
    selector: 'select2',
    template: `<select #selector><ng-content select="option, optgroup"></ng-content></select>`,
    standalone: false
})
export class Select2Component implements AfterViewInit, OnChanges, OnDestroy {
	@ViewChild('selector', { static: true }) selector: ElementRef<HTMLSelectElement>;
	@Input() data: Select2OptionData[];
	@Input() value: string | string[];
	@Input() width: string;
	@Input() disabled = false;
	@Input() options: any;
	@Output() valueChanged = new EventEmitter<{ value: string | string[], data: any }>();

	private element: any;

	constructor(private renderer: Renderer2) {}

	async ngOnChanges(changes: SimpleChanges) {
		if (!this.element) { return; }
		if (changes.data && JSON.stringify(changes.data.previousValue) !== JSON.stringify(changes.data.currentValue)) {
			await this.initPlugin();
			this.valueChanged.emit({ value: this.element.val(), data: this.element.select2('data') });
		}
		if (changes.value && changes.value.previousValue !== changes.value.currentValue) {
			const newValue = changes.value.currentValue;
			this.setElementValue(newValue);
			this.valueChanged.emit({ value: newValue, data: this.element.select2('data') });
		}
		if (changes.disabled && changes.disabled.previousValue !== changes.disabled.currentValue) {
			this.renderer.setProperty(this.selector.nativeElement, 'disabled', this.disabled);
		}
	}

	async ngAfterViewInit() {
		this.element = jQuery(this.selector.nativeElement);
		await this.initPlugin();
		if (typeof this.value !== 'undefined') { this.setElementValue(this.value); }
		this.element.on('select2:select select2:unselect', () => {
			this.valueChanged.emit({ value: this.element.val(), data: this.element.select2('data') });
		});
	}

	ngOnDestroy() {
		if (this.element && this.element.off) { this.element.off('select2:select'); }
	}

	private async initPlugin() {
		if (!this.element.select2) { return; }
		if (this.element.hasClass('select2-hidden-accessible')) {
			this.element.select2('destroy');
			this.renderer.setProperty(this.selector.nativeElement, 'innerHTML', '');
		}
		const options: any = { data: this.data, width: this.width ? this.width : 'resolve', ...this.options };
		if (options.matcher) {
			const oldMatcher: any = await new Promise(resolve =>
				jQuery.fn.select2.amd.require(['select2/compat/matcher'], resolve));
			options.matcher = oldMatcher(options.matcher);
			this.element.select2(options);
			if (typeof this.value !== 'undefined') { this.setElementValue(this.value); }
		} else {
			this.element.select2(options);
		}
		if (this.disabled) { this.renderer.setProperty(this.selector.nativeElement, 'disabled', this.disabled); }
	}

	private setElementValue(newValue: string | string[]) {
		if (Array.isArray(newValue)) {
			for (const option of Array.from(this.selector.nativeElement.options)) {
				if (newValue.indexOf(option.value) > -1) { this.renderer.setProperty(option, 'selected', 'true'); }
			}
		} else {
			this.renderer.setProperty(this.selector.nativeElement, 'value', newValue);
		}
		this.element.trigger('change.select2');
	}
}

@NgModule({ declarations: [Select2Component], exports: [Select2Component] })
export class Select2Module {}
