import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { of } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private apiUrl = environment.apiUrl + 'login';

    constructor(private httpClient: HttpClient) {}

    login(username: string, password: string) {
        // TODO: Integrate with endpoint
        return of(true);
    }

    logout() {
        // TODO: Integrate with endpoint
        return true;
    }
}