import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfirmDialogComponent } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
	let component: ConfirmDialogComponent;
	let fixture: ComponentFixture<ConfirmDialogComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [ConfirmDialogComponent, MatButtonModule],
			providers: [
				{
					provide: MatDialogRef,
					useValue: { close: vi.fn() },
				},
				{
					provide: MAT_DIALOG_DATA,
					useValue: { title: 'Test Title', content: 'Test Content', confirm: 'Test Confirm' },
				},
			],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ConfirmDialogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should throw an error if data is missing', () => {
		TestBed.resetTestingModule();
		TestBed.configureTestingModule({
			imports: [ConfirmDialogComponent, MatButtonModule],
			providers: [
				{
					provide: MatDialogRef,
					useValue: { close: vi.fn() },
				},
				{
					provide: MAT_DIALOG_DATA,
					useValue: null,
				},
			],
		});

		expect(() => {
			fixture = TestBed.createComponent(ConfirmDialogComponent);
			component = fixture.componentInstance;
			fixture.detectChanges();
		}).toThrow('Something is missing in confirm dialog data');
	});

	it('should throw an error if title is missing', () => {
		TestBed.resetTestingModule();
		TestBed.configureTestingModule({
			imports: [ConfirmDialogComponent, MatButtonModule],
			providers: [
				{
					provide: MatDialogRef,
					useValue: { close: vi.fn() },
				},
				{
					provide: MAT_DIALOG_DATA,
					useValue: { content: 'Test Content', confirm: 'Test Confirm' },
				},
			],
		});

		expect(() => {
			fixture = TestBed.createComponent(ConfirmDialogComponent);
			component = fixture.componentInstance;
			fixture.detectChanges();
		}).toThrow('Something is missing in confirm dialog data');
	});

	it('should throw an error if content is missing', () => {
		TestBed.resetTestingModule();
		TestBed.configureTestingModule({
			imports: [ConfirmDialogComponent, MatButtonModule],
			providers: [
				{
					provide: MatDialogRef,
					useValue: { close: vi.fn() },
				},
				{
					provide: MAT_DIALOG_DATA,
					useValue: { title: 'Test Title', confirm: 'Test Confirm' },
				},
			],
		});

		expect(() => {
			fixture = TestBed.createComponent(ConfirmDialogComponent);
			component = fixture.componentInstance;
			fixture.detectChanges();
		}).toThrow('Something is missing in confirm dialog data');
	});

	it('should throw an error if confirm is missing', () => {
		TestBed.resetTestingModule();
		TestBed.configureTestingModule({
			imports: [ConfirmDialogComponent, MatButtonModule],
			providers: [
				{
					provide: MatDialogRef,
					useValue: { close: vi.fn() },
				},
				{
					provide: MAT_DIALOG_DATA,
					useValue: { title: 'Test Title', content: 'Test Content' },
				},
			],
		});

		expect(() => {
			fixture = TestBed.createComponent(ConfirmDialogComponent);
			component = fixture.componentInstance;
			fixture.detectChanges();
		}).toThrow('Something is missing in confirm dialog data');
	});

	it('should close the dialog when onNoClick is called', () => {
		component.onNoClick();

		expect(component.dialogRef.close).toHaveBeenCalledWith();
	});
});
