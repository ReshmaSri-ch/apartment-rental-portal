import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private apiUrl = 'http://127.0.0.1:5000/api';

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
