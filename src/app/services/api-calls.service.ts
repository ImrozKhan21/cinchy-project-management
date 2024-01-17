import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {Observable, of} from "rxjs";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {ConfigService} from '../config.service';
import {CinchyService} from "@cinchy-co/angular-sdk";
import {map, tap} from "rxjs/operators";
import {IActivityType, IProjectDetails, IStatus, IUser} from "../models/common.model";

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
    pj.[Name] as 'project_name',
    pj.[Name] as 'text',
    pj.[Cinchy Id] as 'project_id',
    pj.[Status].[Name] as 'status',
    pj.[Status].[Cinchy Id] as 'statusId',
    pj.[Status].[Sort Order] as 'status_sort',
    pj.[Owner].[Name] as 'owner',
    pj.[Owner].[Photo] as 'owner_photo',
    pj.[Owner].[Cinchy Id] as 'owner_id',
    pj.[Start Date]  as 'start_date',
    pj.[Finish Date] as 'end_date',
    null as 'percent_done',
    null as 'parent_id'
    FROM [${actualModel}].[Project Management].[Projects] pj
    WHERE pj.[Deleted] IS NULL
    AND pj.[Start Date] IS NOT NULL`
    return this.cinchyService.executeCsql(query, {}).pipe(
      map((resp: any) => resp?.queryResult?.toObjectArray()));
  }

  getActivities(model: string): Observable<IProjectDetails[]> {
    const actualModel = model ? model : 'Cinchy Project Management Model V1.0.0';
    //[Project Management Skin Model V1.0.0]
    const query = `SELECT
    pa.[Project].[Name] as 'project_name',
    pa.[Project].[Cinchy Id] as 'project_id',
    pa.[Cinchy Id] as 'activity_id',
    pa.[Status].[Name] as 'status',
    pa.[Status].[Display Colour] as 'status_color',
    pa.[Status].[Display Colour].[Hex Value] as 'status_color_hex',
    pa.[Status].[Cinchy Id] as 'status_id',
    pa.[Status].[Sort Order] as 'status_sort',
    pa.[Owner].[Name] as 'owner',
    pa.[Owner].[Photo] as 'owner_photo',
    pa.[Owner].[Cinchy Id] as 'owner_id',
    pa.[Start Date] as 'start_date',
    pa.[Finish] as 'end_date',
    pa.[% Done] as 'percent_done',
    pa.[Activity] as 'text',
    pa.[Type] as 'activity_type',
    pa.[Type].[Milestone] as 'milestone',
    pa.[Parent].[Cinchy Id] as 'parent_id',
    pa.[Dependencies].[Cinchy Id] as 'dependency_ids'
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
/*
    psc.[Display Colour] as 'status_color',
 */
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

  getAllActivityTypes(model: string): Observable<IActivityType[]> {
    const query = `
    SELECT
        [Label] as 'value',
        [Cinchy Id] as 'id'
    FROM [Project Management].[Activity Types]`;
    return this.cinchyService.executeCsql(query, {}).pipe(
      map((resp: any) => resp?.queryResult?.toObjectArray()));
  }

  updateActivity(model: string, updatedValues: any): Observable<any> {
    const {activityId, statusId, userId, startDate, endDate, activityText, progress} = updatedValues;
    if (!statusId || !activityId) {
      return of(null);
    }
    const actualModel = model ? model : 'Cinchy Project Management Model V1.0.0';
    const query = `UPDATE a
    SET
    a.[Status] = ResolveLink(@statusId,'Cinchy Id'),
    a.[Owner] = CASE
                 WHEN ISNUMERIC(@userId) = 1 THEN ResolveLink(@userId, 'Cinchy Id')
                 ELSE a.[Owner]
               END,
    a.[Activity] = @activityText,
    a.[Start Date] = @startDate,
    a.[Finish Date] = @endDate,
    a.[Percent Done] = @progress
    FROM [${actualModel}].[Project Management].[Project Activities] a
    WHERE a.[Deleted] IS NULL
    AND a.[Cinchy Id] = @activityId
    `;
    const params = {
      '@statusId': statusId,
      '@userId': userId ? userId : null,
      '@startDate': typeof startDate === "string" ? startDate : startDate?.toLocaleDateString(),
      '@endData': typeof endDate === "string" ? endDate : endDate?.toLocaleDateString(),
      '@activityText': activityText,
      '@activityId': activityId,
      '@progress': progress ? progress : 0
    }
    // todo: change [Project Activity Owners] to [Project Owners]
    return this.cinchyService.executeCsql(query, params);
  }

  updateProjectForActivity(model: string, updatedValues: any): Observable<any> {
    const {activityId, parentId} = updatedValues;
    if (!activityId) {
      return of(null);
    }
    const actualModel = model ? model : 'Cinchy Project Management Model V1.0.0';
    const query = `UPDATE a
    SET
    a.[Project] = ResolveLink(@parentId,'Cinchy Id')
    FROM [${actualModel}].[Project Management].[Project Activities] a
    WHERE a.[Deleted] IS NULL
    AND a.[Cinchy Id] = @activityId
    `;
    const params = {
      '@parentId': parentId,
      '@activityId': activityId
    }
    // todo: change [Project Activity Owners] to [Project Owners]
    return this.cinchyService.executeCsql(query, params);
  }

  updateProject(model: string, updatedValues: any): Observable<any> {
    const {activityId, statusId, userId, startDate, endDate, activityText} = updatedValues;
    if (!statusId || !activityId) {
      return of(null);
    }
    const actualModel = model ? model : 'Cinchy Project Management Model V1.0.0';
    const query = `UPDATE a
    SET
    a.[Status] = ResolveLink(@statusId,'Cinchy Id'),
    a.[Start Date] = @startDate,
    a.[Finish Date] = @endDate
    FROM [${actualModel}].[Project Management].[Projects] a
    WHERE a.[Deleted] IS NULL
    AND a.[Cinchy Id] = @projectId
    `;
    const params = {
      '@statusId': statusId,
      '@userId': userId,
      '@startDate': typeof startDate === "string" ? startDate : startDate?.toLocaleDateString(),
      '@endData': typeof endDate === "string" ? endDate : endDate?.toLocaleDateString(),
      '@projectId': activityId
    }
    // todo: change [Project Activity Owners] to [Project Owners]
    return this.cinchyService.executeCsql(query, params);
  }

  insertProject(model: string, updatedValues: any): Observable<any> {
    const {activityId, statusId, userId, startDate, endDate, activityText} = updatedValues;
    if (!activityText) {
      return of(null);
    }
    const actualModel = model ? model : 'Cinchy Project Management Model V1.0.0';
    let query = `INSERT INTO [${actualModel}].[Project Management].[Projects]
           ([Name],
            [Start Date],
            [Finish Date])
        VALUES (
        @projectName,
        @startDate,
        @endDate) `;

    const params = {
      '@startDate': typeof startDate === "string" ? startDate : startDate?.toLocaleDateString(),
      '@endData': typeof endDate === "string" ? endDate : endDate?.toLocaleDateString(),
      '@projectName': activityText,
      '@userId': userId,
    }
    // todo: change [Project Activity Owners] to [Project Owners]
    return this.cinchyService.executeCsql(query, params).pipe(
      map((resp: any) => resp?.queryResult?.toObjectArray()));
  }

  insertActivity(model: string, updatedValues: any): Observable<any> {
    const {parentId, startDate, userId, endDate, activityText, statusId} = updatedValues;
    if (!activityText || !parentId) {
      return of(null);
    }
    const actualModel = model ? model : 'Cinchy Project Management Model V1.0.0';
    let query = `INSERT INTO [${actualModel}].[Project Management].[Project Activities]
           ([Activity],
           [Project],
           [Status],
           [Start Date],
           [Finish Date]
           )
        VALUES (
        @activity,
        ResolveLink(@parentId,'Cinchy Id'),
        ResolveLink(@statusId,'Cinchy Id'),
        @startDate,
        @endDate
        ) `;

    if(userId) {
      query = `INSERT INTO [${actualModel}].[Project Management].[Project Activities]
           ([Activity],
           [Project],
           [Status],
           [Start Date],
           [Finish Date],
           [Owner]
           )
        VALUES (
        @activity,
        ResolveLink(@parentId,'Cinchy Id'),
        ResolveLink(@statusId,'Cinchy Id'),
        @startDate,
        @endDate,
        ResolveLink(@userId,'Cinchy Id')
        ) `;
    }
    const params = {
      '@startDate': typeof startDate === "string" ? startDate : startDate?.toLocaleDateString(),
      '@endData': typeof endDate === "string" ? endDate : endDate?.toLocaleDateString(),
      '@activity': activityText,
      '@parentId': parentId,
      '@statusId': statusId,
      '@userId': userId,
    }
    console.log('PARAMS', params);
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
