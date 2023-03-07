export type ApiError = {
	status: number;
	error: {
		code: string;
		message: string;
	};
};
