export interface Category {
	id: number;
	name: string;
	weighted: boolean;
	users: {
		id: number;
		name: string;
		weight?: number;
	}[];
}
