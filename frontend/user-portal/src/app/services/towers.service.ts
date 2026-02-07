import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class TowersService {
    private apiUrl = `${environment.apiUrl}/towers`;

    constructor(private http: HttpClient) { }

    // Get all towers
    getAll(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl);
    }

    // Get single tower
    getById(id: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/${id}`);
    }

    // Create tower
    create(tower: any): Observable<any> {
        return this.http.post(this.apiUrl, tower);
    }

    // Update tower
    update(id: number, tower: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}`, tower);
    }

    // Delete tower
    delete(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}
