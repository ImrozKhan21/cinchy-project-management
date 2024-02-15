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
    const actualModel = model ? model : 'Cinchy Work Management V1.0.0';
    //[Project Management Skin Model V1.0.0]
    const query = `SELECT
    pj.[Name] as 'project_name',
    pj.[Name] as 'text',
    pj.[Cinchy Id] as 'project_id',
    pj.[Status].[Name] as 'status',
    pj.[Status].[Cinchy Id] as 'statusId',
    pj.[Status].[Sort Order] as 'status_sort',
    pj.[Project Manager].[Name] as 'owner',
    pj.[Project Manager].[Photo] as 'owner_photo',
    pj.[Project Manager].[Cinchy Id] as 'owner_id',
    pj.[Start Date]  as 'start_date',
    pj.[Finish Date] as 'end_date',
    pj.[Parent].[Cinchy Id] as 'parent_id',
    null as 'percent_done'
    FROM [${actualModel}].[Work Management].[Projects] pj
    WHERE pj.[Deleted] IS NULL
    AND pj.[Start Date] IS NOT NULL
    ORDER BY pj.[Name]`
    return this.cinchyService.executeCsql(query, {}).pipe(
      map((resp: any) => resp?.queryResult?.toObjectArray()));
  }

  getActivities(model: string): Observable<IProjectDetails[]> {
    const actualModel = model ? model : 'Cinchy Work Management V1.0.0';
    //[Project Management Skin Model V1.0.0]
    const query = `SELECT
    pa.[Project].[Name] as 'project_name',
    pa.[Project].[Cinchy Id] as 'project_id',
    pa.[Cinchy Id] as 'activity_id',
    pa.[Status].[Name] as 'status',
    pa.[Status].[Colour] as 'status_color',
    pa.[Status].[Colour].[Hex Code] as 'status_color_hex',
    pa.[Status].[Cinchy Id] as 'status_id',
    pa.[Status].[Sort Order] as 'status_sort',
    pa.[Owner].[Name] as 'owner',
    pa.[Owner].[Photo] as 'owner_photo',
    pa.[Owner].[Cinchy Id] as 'owner_id',
    pa.[Start Date] as 'start_date',
    pa.[Finish Date] as 'end_date',
    pa.[% Done] * 100 as 'percent_done',
    pa.[Name] as 'text',
    pa.[Work Type] as 'activity_type',
    pa.[Work Type].[Cinchy Id] as 'activity_type_id',
    pa.[Work Type].[Icon URL] as 'activity_type_icon',
    pa.[Work Type].[Is Milestone] as 'milestone',
    pa.[Parent].[Cinchy Id] as 'parent_id',
    pa.[Dependencies].[Cinchy Id] as 'dependency_ids'
    FROM [${actualModel}].[Work Management].[Work] pa
    WHERE pa.[Deleted] IS NULL
    AND pa.[Name] IS NOT NULL
    ORDER BY pa.[Project].[Name]`
    return this.cinchyService.executeCsql(query, {}).pipe(
      map((resp: any) => resp?.queryResult?.toObjectArray()));
  }

  getAllStatuses(model: string): Observable<IStatus[]> {
    const actualModel = model ? model : 'Cinchy Work Management V1.0.0';
    const query = `SELECT
    psc.[Name] as 'name',
    psc.[Sort Order] as 'sort_order',
    psc.[Colour] as 'status_color',
    psc.[Colour].[Hex Code] as 'status_color_hex',
    psc.[Cinchy Id] as 'id'
    FROM [${actualModel}].[Work Management].[Project Status Codes] psc
    WHERE psc.[Deleted] IS NULL
    ORDER BY psc.[Sort Order]`;
    return this.cinchyService.executeCsql(query, {}).pipe(
      map((resp: any) => resp?.queryResult?.toObjectArray()));
  }

  getAllActivityUsers(model: string): Observable<IUser[]> {
    const actualModel = model ? model : 'Cinchy Work Management V1.0.0';
    const query = `SELECT
    DISTINCT act.[Owner].[Cinchy Id] as 'Cinchy Id'
    INTO #TMP
    FROM [${actualModel}].[Work Management].[Work] act
    WHERE act.[Deleted] IS NOT NULL AND act.[Owner] IS NOT NULL

    SELECT x.* FROM (

    SELECT ppl.[Cinchy Id] as 'owner_id', ppl.[Name] as 'owner', ppl.[Photo] as 'owner_photo'
    FROM [${actualModel}].[Work Management].[People] ppl
    RIGHT JOIN #TMP tmp ON tmp.[Cinchy Id] = ppl.[Cinchy Id]
    WHERE ppl.[Deleted] IS NULL
    AND ppl.[Can Be Assigned] = 0

    UNION ALL

    SELECT ppl2.[Cinchy Id] as 'owner_id', ppl2.[Name] as 'owner', ppl2.[Photo] as 'owner_photo'
    FROM [${actualModel}].[Work Management].[People] ppl2
    WHERE ppl2.[Deleted] IS NULL
    AND ppl2.[Can Be Assigned] = 1
    ) as x
    ORDER BY x.owner`;
    return this.cinchyService.executeCsql(query, {}).pipe(
      map((resp: any) => resp?.queryResult?.toObjectArray()));
  }

  getAllActivityTypes(model: string): Observable<IActivityType[]> {
    const actualModel = model ? model : 'Cinchy Work Management V1.0.0';
    const query = `
    SELECT
        [Name] as 'value',
        [Cinchy Id] as 'id'
    FROM [${actualModel}].[Work Management].[Work Types]`;
    return this.cinchyService.executeCsql(query, {}).pipe(
      map((resp: any) => resp?.queryResult?.toObjectArray()));
  }

  updateActivity(model: string, updatedValues: any): Observable<any> {
    const {activityId, statusId, userId, startDate, endDate, activityText, progress} = updatedValues;
    if (!statusId || !activityId) {
      return of(null);
    }
    const actualModel = model ? model : 'Cinchy Work Management V1.0.0';
    const query = `UPDATE a
    SET
    a.[Status] = ResolveLink(@statusId,'Cinchy Id'),
    a.[Owner] = CASE
                 WHEN ISNUMERIC(@userId) = 1 THEN ResolveLink(@userId, 'Cinchy Id')
                 ELSE a.[Owner]
               END,
    a.[Name] = @activityText
   -- a.[% Done] = @progress
   -- a.[Start Date] = @startDate,
   -- a.[Finish Date] = @endData
    FROM [${actualModel}].[Work Management].[Work] a
    WHERE a.[Deleted] IS NULL
    AND a.[Cinchy Id] = @activityId
    `;
    const params = {
      '@statusId': statusId,
      '@userId': userId ? userId : null,
      '@activityText': activityText,
      '@activityId': activityId,
      '@progress': progress ? progress : 0,
      '@startDate': typeof startDate === "string" ? startDate : startDate?.toLocaleDateString(),
      '@endData': typeof endDate === "string" ? endDate : endDate?.toLocaleDateString(),
    }
    // todo: change [Project Activity Owners] to [Project Owners]
    return this.cinchyService.executeCsql(query, params);
  }

  updateProjectForActivity(model: string, updatedValues: any): Observable<any> {
    const {activityId, parentId} = updatedValues;
    if (!activityId) {
      return of(null);
    }
    const actualModel = model ? model : 'Cinchy Work Management V1.0.0';
    const query = `UPDATE a
    SET
    a.[Project] = ResolveLink(@parentId,'Cinchy Id')
    FROM [${actualModel}].[Work Management].[Work] a
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
    const actualModel = model ? model : 'Cinchy Work Management V1.0.0';
    const query = `UPDATE a
    SET
    a.[Status] = ResolveLink(@statusId,'Cinchy Id'),
    a.[Start Date] = @startDate,
    a.[Finish Date] = @endDate
    FROM [${actualModel}].[Work Management].[Projects] a
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
    const actualModel = model ? model : 'Cinchy Work Management V1.0.0';
    let query = `INSERT INTO [${actualModel}].[Work Management].[Projects]
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
    return this.cinchyService.executeCsql(query, params).pipe(
      map((resp: any) => resp?.queryResult?.toObjectArray()));
  }

  insertActivity(model: string, updatedValues: any, viewType?: string): Observable<any> {
    const {parentId, startDate, userId, endDate, activityText, statusId, activityTypeId, projectId} = updatedValues;
    if (!activityText || !parentId) {
      return of(null);
    }
    const actualModel = model ? model : 'Cinchy Work Management V1.0.0';
    let query = `INSERT INTO [${actualModel}].[Work Management].[Work]
           ([Name],
           [Status],
           [Finish Date],
           [Work Type],
           [Project]
           )
        VALUES (
        @activity,
        ResolveLink(@parentId,'Cinchy Id'),
        ResolveLink(@statusId,'Cinchy Id'),
        @endDate,
        ResolveLink(@activityTypeId,'Cinchy Id'),
        ResolveLink(@projectId,'Cinchy Id')
        ) `;

    if(userId) {
      query = `INSERT INTO [${actualModel}].[Work Management].[Work]
           ([Name],
           [Status],
           [Owner],
           [Work Type],
           [Project]
           )
        VALUES (
        @activity,
        ResolveLink(@statusId,'Cinchy Id'),
        ResolveLink(@userId,'Cinchy Id'),
        ResolveLink(@activityTypeId,'Cinchy Id'),
        ResolveLink(@projectId,'Cinchy Id')
        ) `;
    }
    const params = {
      '@startDate': typeof startDate === "string" ? startDate : startDate?.toLocaleDateString(),
      '@endData': typeof endDate === "string" ? endDate : endDate?.toLocaleDateString(),
      '@activity': activityText,
      '@parentId': parentId,
      '@statusId': statusId,
      '@userId': userId,
      '@activityTypeId': activityTypeId,
      '@projectId': projectId
    }
    console.log('PARAMS', params);
    // todo: change [Project Activity Owners] to [Project Owners]
   // return of(null);
    return this.cinchyService.executeCsql(query, params).pipe(
      map((resp: any) => resp?.queryResult?.toObjectArray()));
  }

  deleteActivity(model: string, activityId: string): Observable<any> {
    const actualModel = model ? model : 'Cinchy Work Management V1.0.0';
    const query = `
       DELETE FROM [${actualModel}].[Work Management].[Work]
       WHERE [Cinchy Id] = @activityId
    `;
    const params = {
      '@activityId': activityId
    }
    return this.cinchyService.executeCsql(query, params).pipe(
      map((resp: any) => resp?.queryResult?.toObjectArray()));
  }

  updateAssignment(model: string, updatedValues: any): Observable<any> {
    const {activityId, userId} = updatedValues;
    const actualModel = model ? model : 'Cinchy Work Management V1.0.0';
    const query = `UPDATE a
    SET
    a.[Owner] = ResolveLink(@userId,'Cinchy Id')
    FROM [${actualModel}].[Work Management].[Work] a
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
