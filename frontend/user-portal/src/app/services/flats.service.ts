import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class FlatsService {
    private apiUrl = `${environment.apiUrl}/flats`;

    constructor(private http: HttpClient) { }

    // Get all flats (admin view)
    getAll(): Observable<any[]> {
        const token = localStorage.getItem('token');
        if (token) {
            return this.http.get<any[]>(this.apiUrl, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
        }
        return this.http.get<any[]>(this.apiUrl);
    }

    // Get flats by floor
    getByFloor(floor: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/${floor}`);
    }

    // Create flat
    create(flat: any): Observable<any> {
        return this.http.post(this.apiUrl, flat);
    }

    // Update flat
    update(id: number, flat: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}`, flat);
    }

    // Delete flat
    delete(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }

    // Update availability
    updateAvailability(id: number, available: boolean): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}/availability`, { available });
    }
}
