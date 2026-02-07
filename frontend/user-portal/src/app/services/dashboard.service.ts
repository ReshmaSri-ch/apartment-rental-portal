import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    // Get dashboard statistics
    getStats(): Observable<any> {
        return this.http.get(`${this.apiUrl}/dashboard/stats`);
    }

    // Get occupancy report
    getOccupancyReport(): Observable<any> {
        return this.http.get(`${this.apiUrl}/dashboard/occupancy`);
    }

    // Get payment report
    getPaymentReport(): Observable<any> {
        return this.http.get(`${this.apiUrl}/dashboard/payments`);
    }

    // Get revenue report
    getRevenueReport(): Observable<any> {
        return this.http.get(`${this.apiUrl}/dashboard/revenue`);
    }
}
