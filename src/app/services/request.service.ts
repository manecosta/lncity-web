import { Injectable } from '@angular/core';
import {
    HttpClient,
    HttpHeaders,
    HttpResponse,
    HttpErrorResponse
} from '@angular/common/http';
import { AppService } from './app.service';
import { User } from '../models/user';

@Injectable()
export class RequestService {
    static instance: RequestService;
    // static baseUrl = 'https://ln.city/api/v1';
    static baseUrl = 'http://127.0.0.1:5001/api/v1';

    constructor(private http: HttpClient, private appService: AppService) {
        RequestService.instance = this;
    }

    private headers() {
        const headers = { 'Content-Type': 'application/json' };
        if (this.appService.authToken) {
            headers['X-Auth-Token'] = this.appService.authToken;
        }
        return new HttpHeaders(headers);
    }

    private url(endpoint: string) {
        if (endpoint.startsWith('/')) {
            return RequestService.baseUrl + endpoint;
        } else {
            return RequestService.baseUrl + '/' + endpoint;
        }
    }

    private renewSession() {
        return this.post(
            '/users/login',
            {
                refresh_token: this.appService.refreshToken
            },
            true,
            false
        );
    }

    private handleError(response: HttpErrorResponse) {
        if (response.status === 401) {
            return this.renewSession()
                .then((renewResponse: HttpResponse<object>) => {
                    this.appService.updateUserAndAuth(
                        new User(renewResponse.body),
                        renewResponse.headers.get('x-auth-token'),
                        renewResponse.headers.get('x-refresh-token')
                    );
                    return Promise.resolve(renewResponse);
                })
                .catch((renewResponse: HttpErrorResponse) => {
                    return Promise.reject(renewResponse);
                });
        } else {
            return Promise.reject(response);
        }
    }

    get(
        endpoint: string,
        returnFullRequest: boolean = false,
        tryRenew: boolean = true
    ): Promise<any> {
        const url = this.url(endpoint);
        return this.http
            .get(url, { headers: this.headers(), observe: 'response' })
            .toPromise()
            .then((response: HttpResponse<object>) => {
                return new Promise((resolvePromise, _) => {
                    resolvePromise(
                        returnFullRequest ? response : response.body
                    );
                });
            })
            .catch((response: HttpErrorResponse) => {
                if (tryRenew) {
                    return this.handleError(response).then(
                        (_: HttpResponse<object>) => {
                            return this.get(endpoint, returnFullRequest, false);
                        }
                    );
                } else {
                    return Promise.reject(response);
                }
            });
    }

    post(
        endpoint: string,
        requestParametersObject: any,
        returnFullRequest: boolean = false,
        tryRenew: boolean = true
    ) {
        const url = this.url(endpoint);
        const body: string = JSON.stringify(requestParametersObject);

        return this.http
            .post(url, body, { headers: this.headers(), observe: 'response' })
            .toPromise()
            .then((response: HttpResponse<object>) => {
                return new Promise((resolvePromise, rejectPromise) => {
                    resolvePromise(
                        returnFullRequest ? response : response.body
                    );
                });
            })
            .catch((response: HttpErrorResponse) => {
                if (tryRenew) {
                    return this.handleError(response).then(
                        (_: HttpResponse<object>) => {
                            return this.post(
                                endpoint,
                                requestParametersObject,
                                returnFullRequest,
                                false
                            );
                        }
                    );
                } else {
                    return Promise.reject(response);
                }
            });
    }
}
