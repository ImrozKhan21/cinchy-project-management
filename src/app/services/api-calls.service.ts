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

    const url = `/API/Project%20Management/Get%20Projects?%7B0%7D=${actualModel}`;
    const fullUrl = `${this.configService.enviornmentConfig?.cinchyRootUrl}${url}`;
    return this.http.get(fullUrl) as Observable<IProjectDetails[]>;

    //[Project Management Skin Model V1.0.0]
    /*    const query = `SELECT
        pj.[Name] as 'project_name',
        pj.[Name] as 'text',
        pj.[Cinchy Id] as 'project_id',
        pj.[Colour].[Hex Value] as 'project_color',
        pj.[Status].[Name] as 'status',
        pj.[Status].[Cinchy Id] as 'status_id',
        pj.[Status].[Sequence] as 'status_sort',
        pj.[Project Manager].[Name] as 'owner',
        pj.[Project Manager].[Photo URL] as 'owner_photo',
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
          map((resp: any) => resp?.queryResult?.toObjectArray()));*/
  }

  getActivities(model: string): Observable<IProjectDetails[]> {
    const actualModel = model ? model : 'Cinchy Work Management V1.0.0';
    const url = `/API/Project%20Management/Get%20Project%20Work?%7B0%7D=${actualModel}`;
    const fullUrl = `${this.configService.enviornmentConfig?.cinchyRootUrl}${url}`;
    return this.http.get(fullUrl) as Observable<IProjectDetails[]>;
    //[Project Management Skin Model V1.0.0]
    /* const query = `SELECT pa.[Project].[Name] as 'project_name', Editable(pa.[Project].[Name]) as 'can_edit-project_name', pa.[Project].[Portfolio] as 'project_portfolio', Editable(pa.[Project].[Portfolio]) as 'can_edit-project_portfolio', pa.[Project].[URL] as 'project_url', Editable(pa.[Project].[URL]) as 'can_edit-project_url', pa.[Project].[Project Manager].[Cinchy Id] as 'project_owner_id',
     Editable(pa.[Project].[Project Manager].[Cinchy Id]) as 'can_edit-project_owner_id',
     pa.[Project].[Cinchy Id] as 'project_id',
     Editable(pa.[Project].[Cinchy Id]) as 'can_edit-project_id',
     pa.[Project].[Colour].[Hex Value] as 'project_color',
     Editable(pa.[Project].[Colour].[Hex Value]) as 'can_edit-project_color',
     pa.[Cinchy Id] as 'activity_id',
     Editable(pa.[Cinchy Id]) as 'can_edit-activity_id',
     pa.[Status].[Name] as 'status',
     Editable(pa.[Status].[Name]) as 'can_edit-status',
     pa.[Status].[Display Colour] as 'status_color',
     pa.[Status].[Display Colour].[Hex Value] as 'status_color_hex',
     pa.[Status].[Cinchy Id] as 'status_id',
     Editable(pa.[Status].[Cinchy Id]) as 'can_edit-status_id',
     pa.[Status].[Sequence] as 'status_sort',
     pa.[Owner].[Name] as 'owner',
     Editable(pa.[Owner].[Name]) as 'can_edit-owner',
     pa.[Owner].[Photo URL] as 'owner_photo',
     pa.[Owner].[Cinchy Id] as 'owner_id',
     Editable(pa.[Owner].[Cinchy Id]) as 'can_edit-owner_id',
     pa.[Owner].[Department] as 'owner_department',
     Editable(pa.[Owner].[Department]) as 'can_edit-owner_department',
     pa.[
                    Start] as 'start_date'
                        , Editable(pa.[Start]) as 'can_edit-start_date'
                        , pa.[Finish] as 'end_date'
                        , Editable(pa.[Finish]) as 'can_edit-end_date'
                        , pa.[% Done] * 100 as 'percent_done'
                        , Editable(pa.[% Done]) as 'can_edit-percent_done'
                        , pa.[Name] as 'text'
                        , Editable(pa.[Name]) as 'can_edit-text'
                        , pa.[Type] as 'activity_type'
                        , Editable(pa.[Type]) as 'can_edit-activity_type'
                        , pa.[Priority] as 'priority'
                        , Editable(pa.[Priority]) as 'can_edit-priority'
                        , pa.[URL] as 'work_url'
                        , Editable(pa.[URL]) as 'can_edit-work_url'
                        , pa.[Description] as 'description'
                        , Editable(pa.[Description]) as 'can_edit-description'
                        , pa.[Total Effort] as 'effort'
                        , Editable(pa.[Total Effort]) as 'can_edit-effort'
                        , pa.[Total Effort].[Cinchy Id] as 'effort_id'
                        , Editable(pa.[Total Effort].[Cinchy Id]) as 'can_edit-effort_id'
                        , pa.[Status Commentary] as 'status_commentary'
                        , Editable(pa.[Status Commentary]) as 'can_edit-status_commentary'
                        , pa.[Type].[Cinchy Id] as 'activity_type_id'
                        , Editable(pa.[Type].[Cinchy Id]) as 'can_edit-activity_type_id'
                        , pa.[Type].[Icon URL] as 'activity_type_icon'
                        , pa.[Type].[Milestone] as 'milestone'
                        , Editable(pa.[Type].[Milestone]) as 'can_edit-milestone'
                        , pa.[Parent].[Cinchy Id] as 'parent_id'
                        , Editable(pa.[Parent].[Cinchy Id]) as 'can_edit-parent_id'
                        , pa.[Parent].[Name] as 'parent_name'
                        , Editable(pa.[Parent].[Name]) as 'can_edit-parent_name'
                        , pa.[Parent].[Type].[Icon URL] as 'parent_type_icon'
                        , pa.[Upstream Dependencies].[Cinchy Id] as 'dependency_ids'
                    FROM [${actualModel}].[Work Management].[Work] pa
                    WHERE pa.[Deleted] IS NULL
                      AND pa.[Name] IS NOT NULL
                    ORDER BY
                      CASE
                      WHEN pa.[Priority] IS NULL THEN 1
                      ELSE 0
     END
     ,
   pa.[Priority] ASC`
     return this.cinchyService.executeCsql(query, {}).pipe(
       map((resp: any) => resp?.queryResult?.toObjectArray()));*/
  }

  getAllStatuses(model: string): Observable<IStatus[]> {
    const actualModel = model ? model : 'Cinchy Work Management V1.0.0';
    const url = `/API/Project%20Management/Get%20Project%20Status%20Codes?%7B0%7D=${actualModel}`;
    const fullUrl = `${this.configService.enviornmentConfig?.cinchyRootUrl}${url}`;
    return this.http.get(fullUrl) as Observable<IStatus[]>;

    /* const query = `SELECT psc.[Name] as 'name', psc.[Sequence] as 'sort_order', psc.[Display Colour] as 'status_color',
     psc.[Display Colour].[Hex Value] as 'status_color_hex',
     psc.[Default Kanban Behaviour] as 'status_collapsed',
     psc.[Cinchy Id] as 'id'
                    FROM [${actualModel}].[Work Management].[Project Status Codes] psc
                    WHERE psc.[Deleted] IS NULL
                    ORDER BY psc.[Sequence]`;
     return this.cinchyService.executeCsql(query, {}).pipe(
       map((resp: any) => resp?.queryResult?.toObjectArray()));*/
  }

  getAllActivityUsers(model: string): Observable<IUser[]> {
    const actualModel = model ? model : 'Cinchy Work Management V1.0.0';
    const url = `/API/Project%20Management/Get People Who Can Be Assigned Work?%7B0%7D=${actualModel}`;
    const fullUrl = `${this.configService.enviornmentConfig?.cinchyRootUrl}${url}`;
    return this.http.get(fullUrl) as Observable<IUser[]>;

    /*    const query = `
          SELECT ppl2.[Cinchy Id] as 'owner_id',
          ppl2.[Label] as 'owner',
          ppl2.[Photo URL] as 'owner_photo'
          FROM [${actualModel}].[Work Management].[People] ppl2
          WHERE ppl2.[Deleted] IS NULL
            AND ppl2.[Can Be Assigned] = 1
          ORDER BY
            CASE WHEN ppl2.[Cinchy User Account].[Cinchy Id] = currentuserid() THEN 0 ELSE 1
          END,
            ppl2.[Label]`;
        return this.cinchyService.executeCsql(query, {}).pipe(
          map((resp: any) => resp?.queryResult?.toObjectArray()));*/
  }

  getDistinctDepartments(model: string): Observable<IUser[]> {
    const actualModel = model ? model : 'Cinchy Work Management V1.0.0';
    const url = `/API/Project%20Management/Get Departments?%7B0%7D=${actualModel}`;
    const fullUrl = `${this.configService.enviornmentConfig?.cinchyRootUrl}${url}`;
    return this.http.get(fullUrl) as Observable<IUser[]>;

    /*    const query = `
          select x.*
          from (SELECT DISTINCT ppl2.[Department] as 'value', ppl2.[Department] as 'id'
                FROM [${actualModel}].[Work Management].[People] ppl2
                WHERE ppl2.[Deleted] IS NULL
                  AND ppl2.[Department] IS NOT NULL
                  AND ppl2.[Can Be Assigned] = 1) as x
          ORDER BY x.[value]`;
        return this.cinchyService.executeCsql(query, {}).pipe(
          map((resp: any) => resp?.queryResult?.toObjectArray()));*/
  }

  getPortfolios(model: string): Observable<IComboType[]> {
    const actualModel = model ? model : 'Cinchy Work Management V1.0.0';
    const url = `/API/Project%20Management/Get Portfolios?%7B0%7D=${actualModel}`;
    const fullUrl = `${this.configService.enviornmentConfig?.cinchyRootUrl}${url}`;
    return this.http.get(fullUrl) as Observable<IComboType[]>;
    /*  const query = `
        SELECT
          [Name] as 'value', [Cinchy Id] as 'id'
        FROM [${actualModel}].[Work Management].[Portfolios]
        WHERE [Deleted] IS NULL
        ORDER BY [Name]`;
      return this.cinchyService.executeCsql(query, {}).pipe(
        map((resp: any) => resp?.queryResult?.toObjectArray()));*/
  }

  getAllActivityTypes(model: string): Observable<IActivityType[]> {
    const actualModel = model ? model : 'Cinchy Work Management V1.0.0';
    const url = `/API/Project%20Management/Get Work Types?%7B0%7D=${actualModel}`;
    const fullUrl = `${this.configService.enviornmentConfig?.cinchyRootUrl}${url}`;
    return this.http.get(fullUrl) as Observable<IActivityType[]>;

    /* return this.http.get(fullUrl) as Observable<IUser[]>;    const query = `
       SELECT
         [Name] as 'value', [Icon URL] as 'icon', [Cinchy Id] as 'id'
       FROM [${actualModel}].[Work Management].[Work Types]
       WHERE [Deleted] IS NULL
       ORDER BY [Sort Order]`;
     return this.cinchyService.executeCsql(query, {}).pipe(
       map((resp: any) => resp?.queryResult?.toObjectArray()));*/
  }

  getAllEstimates(model: string): Observable<IComboType[]> {
    const actualModel = model ? model : 'Cinchy Work Management V1.0.0';
    const url = `/API/Project%20Management/Get Estimates?%7B0%7D=${actualModel}`;
    const fullUrl = `${this.configService.enviornmentConfig?.cinchyRootUrl}${url}`;
    return this.http.get(fullUrl) as Observable<IComboType[]>;

    /*const query = `
      SELECT e.[Description] as 'value', e.[Cinchy Id] as 'id'
      FROM [${actualModel}].[Work Management].[Estimates] e
      WHERE e.[Deleted] IS NULL`;
    return this.cinchyService.executeCsql(query, {}).pipe(
      map((resp: any) => resp?.queryResult?.toObjectArray()));*/
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
    const url = `https://cinchy.net/API/Project Management/ABCDE Update Work Item`;
    /*  const query = `UPDATE a
                    SET a.[Status] = @statusId,
                        a.[Owner]  = CASE
                                       WHEN ISNUMERIC(@userId) = 1 THEN @userIdResolve
                                       ELSE a.[Owner]
                          END,
                        a.[Name]   = @activityText,
                        a.[% Done] = @progress, a.[
                    Start] = @startDate
                        , a.[Finish] = @endData
                        , a.[Priority] = @priority
                        , a.[Total Effort] = @effortId
                        , a.[Status Commentary] = @statusCommentary
                        , a.[Description] = @description
                        , a.[Type] = @activityTypeId
                        , a.[Parent] = @parentActivityId
                    FROM [${actualModel}].[Work Management].[Work] a
                    WHERE a.[Deleted] IS NULL
                      AND a.[Cinchy Id] = @activityId
                      `;
                      */

    const params = {
      '{0}': actualModel,
      '@statusId': statusId ? `${statusId},0` : undefined,
      '@userId': userId ? userId : undefined,
      '@userIdResolve': userId ? `${userId},0` : undefined,
      '@activityText': activityText,
      '@activityId': activityId,
      '@progress': progress ? progress : 0,
      '@startDate': typeof startDate === "string" ? startDate : startDate?.toLocaleDateString(),
      '@endData': typeof endDate === "string" ? endDate : endDate?.toLocaleDateString(),
      '@priority': priority,
      '@effortId': effortId ? `${effortId},0` : undefined,
      '@statusCommentary': statusCommentary,
      '@description': description,
      '@activityTypeId': activityTypeId ? `${activityTypeId},0` : undefined,
      '@parentActivityId': parentActivityId ? `${parentActivityId},0` : undefined
    }
    return this.cinchyService.executeQuery('Project Management', 'Update Work', params);
  }

  updateDatesForActivity(model: string, updatedValues: any): Observable<any> {
    const {activityId, startDate, endDate, priority, progress} = updatedValues;
    if (!activityId) {
      return of(null);
    }
    const actualModel = model ? model : 'Cinchy Work Management V1.0.0';
    // adding priority because end date is not updating when we just do start and finish update
    /*  const query = `UPDATE a
                     SET a.[Start]    = @startDate,
                         a.[Finish]   = @endData,
                         a.[Priority] = @priority,
                         a.[% Done] = @progress
                     FROM [${actualModel}].[Work Management].[Work] a
                     WHERE a.[Deleted] IS NULL
                       AND a.[Cinchy Id] = @activityId
      `;*/
    const params = {
      '{0}': actualModel,
      '@startDate': typeof startDate === "string" ? startDate : startDate?.toLocaleDateString(),
      '@endData': typeof endDate === "string" ? endDate : endDate?.toLocaleDateString(),
      '@activityId': activityId,
      '@priority': priority,
      '@progress': progress ? progress : 0,
    }
    return this.cinchyService.executeQuery('Project Management', 'Update Work Schedule', params);

    /* return this.cinchyService.executeCsql(query, params).pipe(
      map((resp: any) => resp?.queryResult?.toObjectArray()));*/
  }

  updateParentForActivity(model: string, updatedValues: any): Observable<any> {
    const {activityId, parentId} = updatedValues;
    if (!activityId) {
      return of(null);
    }
    const actualModel = model ? model : 'Cinchy Work Management V1.0.0';
    /*    const query = `UPDATE a
                       SET a.[Parent] = @parentId FROM [${actualModel}].[Work Management].[Work] a
                       WHERE a.[Deleted] IS NULL
                         AND a.[Cinchy Id] = @activityId
        `;*/
    const params = {
      '{0}': actualModel,
      '@parentId': parentId ? `${parentId},0` : null,
      '@activityId': activityId
    }

    return this.cinchyService.executeQuery('Project Management', 'Update Work Parent', params);

    //  return this.cinchyService.executeCsql(query, params);
  }

  updateProjectForActivity(model: string, updatedValues: any): Observable<any> {
    const {activityId, parentId} = updatedValues;
    if (!activityId) {
      return of(null);
    }
    const actualModel = model ? model : 'Cinchy Work Management V1.0.0';
    /*    const query = `UPDATE a
                       SET a.[Project] = @parentId FROM [${actualModel}].[Work Management].[Work] a
                       WHERE a.[Deleted] IS NULL
                         AND a.[Cinchy Id] = @activityId
        `;
        */
    const params = {
      '{0}': actualModel,
      '@parentId': parentId ? `${parentId},0` : null,
      '@activityId': activityId
    }
    return this.cinchyService.executeQuery('Project Management', 'Update Work Project', params);

    //  return this.cinchyService.executeCsql(query, params);
  }

  updateProject(model: string, updatedValues: any): Observable<any> {
    const {activityId, statusId, userId, startDate, endDate, activityText} = updatedValues;
    if (!statusId || !activityId) {
      return of(null);
    }
    const actualModel = model ? model : 'Cinchy Work Management V1.0.0';
    /* const query = `UPDATE a
                    SET a.[Status] = @statusId,
                        a.[Start]  = @startDate,
                        a.[Finish] = @endDate FROM [${actualModel}].[Work Management].[Projects] a
                    WHERE a.[Deleted] IS NULL
                      AND a.[Cinchy Id] = @projectId
     `;*/
    const params = {
      '{0}': actualModel,
      '@statusId': statusId ? `${statusId},0` : null,
      '@userId': userId,
      '@startDate': typeof startDate === "string" ? startDate : startDate?.toLocaleDateString(),
      '@endData': typeof endDate === "string" ? endDate : endDate?.toLocaleDateString(),
      '@projectId': activityId
    }
//ABCDE Update Project
//    return this.cinchyService.executeCsql(query, params);
    return this.cinchyService.executeQuery('Project Management', 'Update Project', params);
  }

  insertProject(model: string, updatedValues: any): Observable<any> {
    const {activityId, statusId, userId, startDate, endDate, activityText} = updatedValues;
    if (!activityText) {
      return of(null);
    }
    const actualModel = model ? model : 'Cinchy Work Management V1.0.0';
    /* let query = `INSERT INTO [${actualModel}].[Work Management].[Projects]
                  ([Name],
                    [Start],
                  [Finish])
                  VALUES (
                    @projectName, @startDate, @endDate) `;*/

    const params = {
      '{0}': actualModel,
      '@startDate': typeof startDate === "string" ? startDate : startDate?.toLocaleDateString(),
      '@endData': typeof endDate === "string" ? endDate : endDate?.toLocaleDateString(),
      '@projectName': activityText,
      '@userId': userId,
    }
    return this.cinchyService.executeQuery('Project Management', 'Insert Project', params);

    /*return this.cinchyService.executeCsql(query, params).pipe(
      map((resp: any) => resp?.queryResult?.toObjectArray()));*/
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
    /*let query = `INSERT INTO [${actualModel}].[Work Management].[Work]
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
                 [Parent])
                 VALUES (
                   @activity, ResolveLink(@statusId, 'Cinchy Id'), @endDate, @startDate, ResolveLink(@activityTypeId, 'Cinchy Id'), ResolveLink(@projectId, 'Cinchy Id'), ResolveLink(@userId, 'Cinchy Id'), @progress, @priority, @effortId, @statusCommentary, @description, ResolveLink(@parentId, 'Cinchy Id')
                   )
    SELECT @cinchy_row_id as 'id';
    `;*/

    const params = {
      '{0}': actualModel,
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
    return this.cinchyService.executeQuery('Project Management', 'Insert Work', params)
      .pipe(map((resp: any) => resp?.queryResult?._jsonResult));

    /*   return this.cinchyService.executeCsql(query, params).pipe(
         map((resp: any) => resp?.queryResult?.toObjectArray()));*/
  }

  deleteActivity(model: string, activityId: string): Observable<any> {
    const actualModel = model ? model : 'Cinchy Work Management V1.0.0';
    /*   const query = `
         DELETE
         FROM [${actualModel}].[Work Management].[Work]
         WHERE [Cinchy Id] = @activityId
       `;*/
    const params = {
      '{0}': actualModel,
      '@activityId': activityId
    }
    return this.cinchyService.executeQuery('Project Management', 'Delete Work', params)
      .pipe(map((resp: any) => resp?.queryResult?._jsonResult));
    /* return this.cinchyService.executeCsql(query, params).pipe(
       map((resp: any) => resp?.queryResult?.toObjectArray()));*/
  }

  updateAssignment(model: string, updatedValues: any): Observable<any> {
    const {activityId, userId} = updatedValues;
    const actualModel = model ? model : 'Cinchy Work Management V1.0.0';
    /* const query = `UPDATE a
                    SET a.[Owner] = ResolveLink(@userId, 'Cinchy Id') FROM [${actualModel}].[Work Management].[Work] a
                    WHERE a.[Deleted] IS NULL
                      AND a.[Cinchy Id] = @activityId
     `;*/
    const params = {
      '{0}': actualModel,
      '@userId': userId,
      '@activityId': activityId
    }
    return this.cinchyService.executeQuery('Project Management', 'Update Work Owner', params)
      .pipe(map((resp: any) => resp?.queryResult?._jsonResult));
    /* return this.cinchyService.executeCsql(query, params).pipe(
       map((resp: any) => resp?.queryResult?.toObjectArray()));*/
  }

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

