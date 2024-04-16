import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {Observable, of} from "rxjs";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {ConfigService} from '../config.service';
import {CinchyService} from "@cinchy-co/angular-sdk";
import {map, tap} from "rxjs/operators";
import {IActivityType, IComboType, IProjectDetails, IStatus, IUser} from "../models/common.model";

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
    pj.[Colour].[Hex Code] as 'project_color',
    pj.[Status].[Name] as 'status',
    pj.[Status].[Cinchy Id] as 'statusId',
    pj.[Status].[Sort Order] as 'status_sort',
    pj.[Project Manager].[Name] as 'owner',
    pj.[Project Manager].[Photo] as 'owner_photo',
    pj.[Project Manager].[Cinchy Id] as 'owner_id',
    pj.[Start]  as 'start_date',
    pj.[Finish] as 'end_date',
    pj.[Portfolio] as 'portfolio',
    pj.[URL] as 'project_url',
    pj.[Parent].[Cinchy Id] as 'parent_id',
    null as 'percent_done'
    FROM [${actualModel}].[Work Management].[Projects] pj
    WHERE pj.[Deleted] IS NULL
    AND pj.[Name] IS NOT NULL
    ORDER BY pj.[Name]`
    return this.cinchyService.executeCsql(query, {}).pipe(
      map((resp: any) => resp?.queryResult?.toObjectArray()));
  }

  getActivities(model: string): Observable<IProjectDetails[]> {
    const actualModel = model ? model : 'Cinchy Work Management V1.0.0';
    //[Project Management Skin Model V1.0.0]
    const query = `SELECT
    pa.[Project].[Name] as 'project_name',
    pa.[Project].[Portfolio] as 'project_portfolio',
    pa.[Project].[URL] as 'project_url',
    pa.[Project].[Project Manager].[Cinchy Id] as 'project_owner_id',
    pa.[Project].[Cinchy Id] as 'project_id',
    pa.[Project].[Colour].[Hex Code] as 'project_color',
    pa.[Cinchy Id] as 'activity_id',
    pa.[Status].[Name] as 'status',
    pa.[Status].[Colour] as 'status_color',
    pa.[Status].[Colour].[Hex Code] as 'status_color_hex',
    pa.[Status].[Cinchy Id] as 'status_id',
    pa.[Status].[Sort Order] as 'status_sort',
    pa.[Owner].[Name] as 'owner',
    pa.[Owner].[Photo] as 'owner_photo',
    pa.[Owner].[Cinchy Id] as 'owner_id',
    pa.[Owner].[Department] as 'owner_department',
    pa.[Start] as 'start_date',
    pa.[Finish] as 'end_date',
    pa.[% Done] * 100 as 'percent_done',
    pa.[Name] as 'text',
    pa.[Type] as 'activity_type',
    pa.[Priority] as 'priority',
    pa.[URL] as 'work_url',
    pa.[Description] as 'description',
    pa.[Total Effort] as 'effort',
    pa.[Total Effort].[Cinchy Id] as 'effort_id',
    pa.[Status Commentary] as 'status_commentary',
    pa.[Type].[Cinchy Id] as 'activity_type_id',
    pa.[Type].[Icon URL] as 'activity_type_icon',
    pa.[Type].[Milestone] as 'milestone',
    pa.[Parent].[Cinchy Id] as 'parent_id',
    pa.[Parent].[Name] as 'parent_name',
    pa.[Parent].[Type].[Icon URL] as 'parent_type_icon',
    pa.[Dependencies].[Cinchy Id] as 'dependency_ids'
    FROM [${actualModel}].[Work Management].[Work] pa
    WHERE pa.[Deleted] IS NULL
    AND pa.[Name] IS NOT NULL
    ORDER BY
                     CASE
                     WHEN pa.[Priority] IS NULL THEN 1
                     ELSE 0
    END,
  pa.[Priority] ASC`
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
    psc.[Default Kanban Behaviour] as 'status_collapsed',
    psc.[Cinchy Id] as 'id'
    FROM [${actualModel}].[Work Management].[Project Status Codes] psc
    WHERE psc.[Deleted] IS NULL
    ORDER BY psc.[Sort Order]`;
    return this.cinchyService.executeCsql(query, {}).pipe(
      map((resp: any) => resp?.queryResult?.toObjectArray()));
  }

  getAllActivityUsers(model: string): Observable<IUser[]> {
    const actualModel = model ? model : 'Cinchy Work Management V1.0.0';
    const query = `
      SELECT
      ppl2.[Cinchy Id] as 'owner_id',
      ppl2.[Label] as 'owner',
      ppl2.[Photo] as 'owner_photo'
      FROM [${actualModel}].[Work Management].[People] ppl2
    WHERE ppl2.[Deleted] IS NULL
    AND ppl2.[Can Be Assigned] = 1
    ORDER BY
        CASE WHEN ppl2.[Cinchy User Account].[Cinchy Id] = currentuserid() THEN 0 ELSE 1 END,
        ppl2.[Label]`;
    return this.cinchyService.executeCsql(query, {}).pipe(
      map((resp: any) => resp?.queryResult?.toObjectArray()));
  }

  getDistinctDepartments(model: string): Observable<IUser[]> {
    const actualModel = model ? model : 'Cinchy Work Management V1.0.0';
    const query = `
      select x.* from (
                        SELECT DISTINCT
                          ppl2.[Department] as 'value',
                          ppl2.[Department] as 'id'
                        FROM [${actualModel}].[Work Management].[People] ppl2
                        WHERE ppl2.[Deleted] IS NULL
                          AND ppl2.[Department] IS NOT NULL
                          AND ppl2.[Can Be Assigned] = 1
                      ) as x
      ORDER BY x.[value]`;
    return this.cinchyService.executeCsql(query, {}).pipe(
      map((resp: any) => resp?.queryResult?.toObjectArray()));
  }

  getPortfolios(model: string): Observable<IComboType[]> {
    const actualModel = model ? model : 'Cinchy Work Management V1.0.0';
    const query = `
    SELECT
        [Name] as 'value',
        [Cinchy Id] as 'id'
    FROM [${actualModel}].[Work Management].[Portfolios]
    WHERE [Deleted] IS NULL
    ORDER BY [Name]`;
    return this.cinchyService.executeCsql(query, {}).pipe(
      map((resp: any) => resp?.queryResult?.toObjectArray()));
  }

  getAllActivityTypes(model: string): Observable<IActivityType[]> {
    const actualModel = model ? model : 'Cinchy Work Management V1.0.0';
    const query = `
    SELECT
        [Name] as 'value',
        [Icon URL] as 'icon',
        [Cinchy Id] as 'id'
    FROM [${actualModel}].[Work Management].[Work Types]
    WHERE [Deleted] IS NULL
    ORDER BY [Sort Order]`;
    return this.cinchyService.executeCsql(query, {}).pipe(
      map((resp: any) => resp?.queryResult?.toObjectArray()));
  }

  getAllEstimates(model: string): Observable<IComboType[]> {
    const actualModel = model ? model : 'Cinchy Work Management V1.0.0';
    const query = `
    SELECT
        e.[Description] as 'value',
        e.[Cinchy Id] as 'id'
    FROM [${actualModel}].[Work Management].[Estimates] e
    WHERE e.[Deleted] IS NULL`;
    return this.cinchyService.executeCsql(query, {}).pipe(
      map((resp: any) => resp?.queryResult?.toObjectArray()));
  }

  updateActivity(model: string, updatedValues: any): Observable<any> {
    const {
      activityId,
      statusId,
      userId,
      startDate,
      endDate,
      activityText,
      progress,
      priority,
      effortId,
      statusCommentary,
      description,
      activityTypeId,
      parentActivityId
    } = updatedValues;
    if (!statusId || !activityId) {
      return of(null);
    }
    const actualModel = model ? model : 'Cinchy Work Management V1.0.0';
    const query = `UPDATE a
      SET a.[Status] = @statusId,
          a.[Owner]  = CASE
                         WHEN ISNUMERIC(@userId) = 1 THEN @userIdResolve
                         ELSE a.[Owner]
            END,
          a.[Name]   = @activityText,
          a.[% Done] = @progress,
          a.[Start] = @startDate,
          a.[Finish] = @endData,
          a.[Priority] = @priority,
          a.[Total Effort] = @effortId,
          a.[Status Commentary] = @statusCommentary,
          a.[Description] = @description,
          a.[Type] = @activityTypeId,
          a.[Parent] = @parentActivityId
                   FROM [${actualModel}].[Work Management].[Work] a
                   WHERE a.[Deleted] IS NULL
                   AND a.[Cinchy Id] = @activityId
    `;
    const params = {
      '@statusId': statusId ? `${statusId},0` : null,
      '@userId': userId ? userId : null,
      '@userIdResolve': userId ? `${userId},0` : null,
      '@activityText': activityText,
      '@activityId': activityId,
      '@progress': progress ? progress : 0,
      '@startDate': typeof startDate === "string" ? startDate : startDate?.toLocaleDateString(),
      '@endData': typeof endDate === "string" ? endDate : endDate?.toLocaleDateString(),
      '@priority': priority,
      '@effortId': effortId ? `${effortId},0` : null,
      '@statusCommentary': statusCommentary,
      '@description': description,
      '@activityTypeId': activityTypeId ? `${activityTypeId},0` : null,
      '@parentActivityId': parentActivityId ? `${parentActivityId},0` : null
    }
    // todo: change [Project Activity Owners] to [Project Owners]
    return this.cinchyService.executeCsql(query, params);
  }

  updateDatesForActivity(model: string, updatedValues: any): Observable<any> {
    const {activityId, startDate, endDate, priority, progress} = updatedValues;
    if (!activityId) {
      return of(null);
    }
    const actualModel = model ? model : 'Cinchy Work Management V1.0.0';
    // adding priority because end date is not updating when we just do start and finish update
    const query = `UPDATE a
    SET
      a.[Start] = @startDate,
      a.[Finish] = @endData,
      a.[Priority] = @priority,
      a.[% Done] = @progress
    FROM [${actualModel}].[Work Management].[Work] a
    WHERE a.[Deleted] IS NULL
    AND a.[Cinchy Id] = @activityId
    `;
    const params = {
      '@startDate': typeof startDate === "string" ? startDate : startDate?.toLocaleDateString(),
      '@endData': typeof endDate === "string" ? endDate : endDate?.toLocaleDateString(),
      '@activityId': activityId,
      '@priority': priority,
      '@progress': progress ? progress : 0,
    }
    return this.cinchyService.executeCsql(query, params).pipe(
      map((resp: any) => resp?.queryResult?.toObjectArray()));
  }

  updateParentForActivity(model: string, updatedValues: any): Observable<any> {
    const {activityId, parentId} = updatedValues;
    if (!activityId) {
      return of(null);
    }
    const actualModel = model ? model : 'Cinchy Work Management V1.0.0';
    const query = `UPDATE a
    SET
    a.[Parent] = @parentId
    FROM [${actualModel}].[Work Management].[Work] a
    WHERE a.[Deleted] IS NULL
    AND a.[Cinchy Id] = @activityId
    `;
    const params = {
      '@parentId': parentId ? `${parentId},0` : null,
      '@activityId': activityId
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
    a.[Project] = @parentId
    FROM [${actualModel}].[Work Management].[Work] a
    WHERE a.[Deleted] IS NULL
    AND a.[Cinchy Id] = @activityId
    `;
    const params = {
      '@parentId': parentId ? `${parentId},0` : null,
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
    a.[Status] = @statusId,
    a.[Start] = @startDate,
    a.[Finish] = @endDate
    FROM [${actualModel}].[Work Management].[Projects] a
    WHERE a.[Deleted] IS NULL
    AND a.[Cinchy Id] = @projectId
    `;
    const params = {
      '@statusId': statusId ? `${statusId},0` : null,
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
            [Start],
            [Finish])
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
    const {
      parentId, startDate, userId, endDate, activityText, statusId, activityTypeId, projectId, progress,
      priority,
      effortId,
      statusCommentary,
      description
    } = updatedValues;
    if (!activityText || !parentId) {
      return of(null);
    }
    const actualModel = model ? model : 'Cinchy Work Management V1.0.0';
    let query = `INSERT INTO [${actualModel}].[Work Management].[Work]
           ([Name],
           [Status],
           [Finish],
           [Start],
           [Type],
           [Project],
           [Owner],
           [% Done],
           [Priority],
           [Total Effort],
           [Status Commentary],
           [Description],
           [Parent]
           )
                 VALUES (
                   @activity,
                   ResolveLink(@statusId, 'Cinchy Id'),
                   @endDate,
                   @startDate,
                   ResolveLink(@activityTypeId, 'Cinchy Id'),
                   ResolveLink(@projectId, 'Cinchy Id'),
                   ResolveLink(@userId, 'Cinchy Id'),
                   @progress,
                   @priority,
                   @effortId,
                   @statusCommentary,
                   @description,
                   ResolveLink(@parentId, 'Cinchy Id')
        )
        SELECT @cinchy_row_id as 'id';
        `;

    const params = {
      '@activity': activityText,
      '@parentId': parentId,
      '@statusId': statusId,
      '@userId': userId,
      '@activityTypeId': activityTypeId,
      '@projectId': projectId,
      '@progress': progress ? progress : 0,
      '@startDate': typeof startDate === "string" ? startDate : startDate?.toLocaleDateString(),
      '@endData': typeof endDate === "string" ? endDate : endDate?.toLocaleDateString(),
      '@priority': priority,
      '@effortId': effortId ? `${effortId},0` : null,
      '@statusCommentary': statusCommentary,
      '@description': description
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

  getTableEntitlements(): Observable<any> {
    const domain = 'Project Management';
    const tableName = 'Project Work'
    return this.cinchyService.getTableEntitlementsByName(domain, tableName);
  }
}
