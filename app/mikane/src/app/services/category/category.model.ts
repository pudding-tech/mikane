export interface Category {
	id: string;
	name: string;
	icon: string;
	weighted: boolean;
	created: Date;
	users: {
		id: string;
		name: string;
		weight?: number;
	}[];
}
