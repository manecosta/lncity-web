import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class RequestService {
    static instance: RequestService;

    constructor(private http: HttpClient) {
        RequestService.instance = this;
    }

    private options() {
        return new HttpHeaders({ 'Content-Type': 'application/json' });
    }

    get(url: string): Promise<any> {
        return this.http.get(url, { headers: this.options() }).toPromise();
    }

    post(url: string, requestParametersObject: any) {
        let body: string = JSON.stringify(requestParametersObject);

        return this.http
            .post(url, body, { headers: this.options() })
            .toPromise();
    }
}
