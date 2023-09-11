import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {Observable, of} from "rxjs";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {ConfigService} from '../config.service';
import {CinchyService} from "@cinchy-co/angular-sdk";
import {map, tap} from "rxjs/operators";
import {IProjectDetails} from "../models/common.model";

@Injectable({
  providedIn: 'root'
})
export class ApiCallsService {

  constructor(private http: HttpClient, private cinchyService: CinchyService, @Inject(PLATFORM_ID) private platformId: any,
              private configService: ConfigService) {
  }

  cachedSections: any = {};
  domain: string | undefined;

  getProjectDetails(model: string): Observable<IProjectDetails[]> {
    const actualModel = model ? model : 'Cinchy Project Management Model V1.0.0';
    //[Project Management Skin Model V1.0.0]
    const query = `SELECT
    pa.[Project].[Name] as 'project_name',
    pa.[Status].[Name] as 'status',
    pa.[Status].[Sort Order] as 'status_sort',
    pa.[Owner].[Name] as 'owner',
    pa.[Owner].[Photo] as 'owner_photo',
    [Start Date] as 'start_date',
    [Finish Date] as 'end_date',
    [Activity] as 'text'
    FROM [${actualModel}].[Project Management].[Project Activities] pa
    WHERE pa.[Deleted] IS NULL
    AND pa.[Start Date] IS NOT NULL
    ORDER BY pa.[Status].[Sort Order]`
    return this.cinchyService.executeCsql(query, {}).pipe(
      map((resp: any) => resp?.queryResult?.toObjectArray()));
  }

  getEnvDetails(): Observable<any> {
    const url = `/API/Experiences/Get%20DX%20Environments`;
    return this.getResponse(url).pipe(
      tap(resp => {
        this.domain = resp[0].domain
      }));
  }

  //

  getResponse(url: string): Observable<any> {
    const fullUrl = `${this.configService.enviornmentConfig?.cinchyRootUrl}${url}`
    return this.http.get(fullUrl, {
      headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded'),
      responseType: 'text'
    }).pipe(
      map(resp => {
        const {data, schema} = JSON.parse(resp);
        return this.toObjectArray(data, schema);
      }))
  }

  toObjectArray(data: any, schema: any): Array<Object> {
    let result: any = [];
    data?.forEach((row: any) => {
      let rowObject: any = {};
      for (let i = 0; i < row.length; i++) {
        rowObject[schema[i].columnName] = row[i];
      }
      result.push(rowObject);
    });
    return result;
  }

  executeCinchyQueries(name: string, domain: string, options?: any, isInsert?: boolean): Observable<any> {
    return this.cinchyService.executeQuery(domain, name, options).pipe(
      map(resp => isInsert ? resp : resp?.queryResult?.toObjectArray())
    );
  }
}
