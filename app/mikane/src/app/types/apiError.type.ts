export interface ApiError {
	status: number;
	error: {
		code: string;
		message: string;
	};
}
