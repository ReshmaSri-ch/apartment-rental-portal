import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AmenitiesService {
    private apiUrl = `${environment.apiUrl}/amenities`;

    constructor(private http: HttpClient) { }

    // Get all amenities
    getAll(activeOnly: boolean = false): Observable<any[]> {
        const url = activeOnly ? `${this.apiUrl}?active=true` : this.apiUrl;
        return this.http.get<any[]>(url);
    }

    // Get single amenity
    getById(id: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/${id}`);
    }

    // Create amenity
    create(amenity: any): Observable<any> {
        return this.http.post(this.apiUrl, amenity);
    }

    // Update amenity
    update(id: number, amenity: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}`, amenity);
    }

    // Delete amenity
    delete(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}
