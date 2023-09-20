import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {Observable, of} from "rxjs";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {ConfigService} from '../config.service';
import {CinchyService} from "@cinchy-co/angular-sdk";
import {map, tap} from "rxjs/operators";
import {IProjectDetails, IStatus, IUser} from "../models/common.model";

@Injectable({
  providedIn: 'root'
})
export class ApiCallsService {

  constructor(private http: HttpClient, private cinchyService: CinchyService, @Inject(PLATFORM_ID) private platformId: any,
              private configService: ConfigService) {
  }

  cachedSections: any = {};
  domain: string | undefined;

  getAllProjects(model: string): Observable<IProjectDetails[]> {
    const actualModel = model ? model : 'Cinchy Project Management Model V1.0.0';
    //[Project Management Skin Model V1.0.0]
    const query = `SELECT
    pa.[Name] as 'project_name',
    pa.[Cinchy Id] as 'project_id',
    pa.[Status].[Name] as 'status',
    pa.[Status].[Cinchy Id] as 'statusId',
    pa.[Start Date] as 'start_date',
    pa.[Finish Date] as 'end_date',
    pa.[Name] as 'text',
    pa.[Owner].[Name] as 'owner',
    pa.[Owner].[Cinchy Id] as 'owner_id'
    FROM [${actualModel}].[Project Management].[Projects] pa
    WHERE pa.[Deleted] IS NULL
    AND pa.[Start Date] IS NOT NULL`
    return this.cinchyService.executeCsql(query, {}).pipe(
      map((resp: any) => resp?.queryResult?.toObjectArray()));
  }

  getProjectDetails(model: string): Observable<IProjectDetails[]> {
    const actualModel = model ? model : 'Cinchy Project Management Model V1.0.0';
    //[Project Management Skin Model V1.0.0]
    const query = `SELECT
    pa.[Project].[Name] as 'project_name',
    pa.[Cinchy Id] as 'project_id',
    pa.[Project].[Cinchy Id] as 'parent_id',
    pa.[Status].[Name] as 'status',
    pa.[Status].[Cinchy Id] as 'status_id',
    pa.[Status] as 'full_status',
    pa.[Status].[Sort Order] as 'status_sort',
    pa.[Owner].[Name] as 'owner',
    pa.[Owner].[Photo] as 'owner_photo',
    pa.[Owner].[Cinchy Id] as 'owner_id',
    pa.[Start Date] as 'start_date',
    pa.[Finish Date] as 'end_date',
    pa.[Activity] as 'text'
    FROM [${actualModel}].[Project Management].[Project Activities] pa
    WHERE pa.[Deleted] IS NULL
    AND pa.[Activity] IS NOT NULL
    ORDER BY pa.[Status].[Sort Order]`
    return this.cinchyService.executeCsql(query, {}).pipe(
      map((resp: any) => resp?.queryResult?.toObjectArray()));
  }

  getAllStatuses(model: string): Observable<IStatus[]> {
    const actualModel = model ? model : 'Cinchy Project Management Model V1.0.0';
    const query = `SELECT
    psc.[Name] as 'name',
    psc.[Sort Order] as 'sort_order',
    psc.[Cinchy Id] as 'id'
    FROM [${actualModel}].[Project Management].[Project Status Codes] psc
    WHERE psc.[Deleted] IS NULL
    ORDER BY psc.[Sort Order]`;
    return this.cinchyService.executeCsql(query, {}).pipe(
      map((resp: any) => resp?.queryResult?.toObjectArray()));
  }

  getAllActivityUsers(model: string): Observable<IUser[]> {
    const actualModel = model ? model : 'Cinchy Project Management Model V1.0.0';
    const query = `SELECT
    DISTINCT act.[Owner].[Cinchy Id] as 'Cinchy Id'
    INTO #TMP
    FROM [Cinchy Project Management Model V1.0.0].[Project Management].[Project Activities] act
    WHERE act.[Deleted] IS NOT NULL AND act.[Owner] IS NOT NULL

    SELECT x.* FROM (

    SELECT ppl.[Cinchy Id] as 'owner_id', ppl.[Name] as 'owner', ppl.[Photo] as 'owner_photo'
    FROM [${actualModel}].[Project Management].[People] ppl
    RIGHT JOIN #TMP tmp ON tmp.[Cinchy Id] = ppl.[Cinchy Id]
    WHERE ppl.[Deleted] IS NULL
    AND ppl.[Can Be Assigned] = 0

    UNION ALL

    SELECT ppl2.[Cinchy Id] as 'owner_id', ppl2.[Name] as 'owner', ppl2.[Photo] as 'owner_photo'
    FROM [${actualModel}].[Project Management].[People] ppl2
    WHERE ppl2.[Deleted] IS NULL
    AND ppl2.[Can Be Assigned] = 1
    ) as x
    ORDER BY x.owner`;
    return this.cinchyService.executeCsql(query, {}).pipe(
      map((resp: any) => resp?.queryResult?.toObjectArray()));
  }

  updateActivity(model: string, updatedValues: any): Observable<any> {
    const {activityId, statusId, userId, startDate, endDate, activityText} = updatedValues;
    if (!statusId || !activityId) {
      return of(null);
    }
    const actualModel = model ? model : 'Cinchy Project Management Model V1.0.0';
    const query = `UPDATE a
    SET
    a.[Status] = ResolveLink(@statusId,'Cinchy Id'),
    a.[Owner] = ResolveLink(@userId,'Cinchy Id'),
    a.[Activity] = @activityText,
    a.[Start Date] = @startDate,
    a.[Finish Date] = @endDate
    FROM [${actualModel}].[Project Management].[Project Activities] a
    WHERE a.[Deleted] IS NULL
    AND a.[Cinchy Id] = @activityId
    `;
    const params = {
      '@statusId': statusId,
      '@userId': userId,
      '@startDate': typeof startDate === "string" ? startDate : startDate?.toLocaleDateString(),
      '@endData': typeof endDate === "string" ? endDate : endDate?.toLocaleDateString(),
      '@activityText': activityText,
      '@activityId': activityId
    }
    // todo: change [Project Activity Owners] to [Project Owners]
    return this.cinchyService.executeCsql(query, params).pipe(
      map((resp: any) => resp?.queryResult?.toObjectArray()));
  }

  updateAssignment(model: string, updatedValues: any): Observable<any> {
    const {activityId, userId} = updatedValues;
    const actualModel = model ? model : 'Cinchy Project Management Model V1.0.0';
    const query = `UPDATE a
    SET
    a.[Owner] = ResolveLink(@userId,'Cinchy Id')
    FROM [${actualModel}].[Project Management].[Project Activities] a
    WHERE a.[Deleted] IS NULL
    AND a.[Cinchy Id] = @activityId
    `;
    const params = {
      '@userId': userId,
      '@activityId': activityId
    }
    // todo: change [Project Activity Owners] to [Project Owners]
    return this.cinchyService.executeCsql(query, params).pipe(
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
