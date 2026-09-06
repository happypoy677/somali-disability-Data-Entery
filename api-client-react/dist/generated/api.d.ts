import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { AdminSetupInput, AuthUser, Backup, BackupInput, DashboardSummary, ErrorResponse, GoogleDriveBackupInput, HealthStatus, ImportInput, ImportResult, ListPeopleParams, LoginInput, MessageResponse, PasswordChangeInput, Person, PersonInput, PersonUpdate, SetupStatus, UsernameChangeInput } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * Returns server health status
 * @summary Health check
 */
export declare const healthCheck: (options?: Parameters<typeof customFetch>[1]) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetSetupStatusUrl: () => string;
/**
 * @summary Check whether an administrator exists
 */
export declare const getSetupStatus: (options?: Parameters<typeof customFetch>[1]) => Promise<SetupStatus>;
export declare const getGetSetupStatusQueryKey: () => readonly ["/api/auth/setup-status"];
export declare const getGetSetupStatusQueryOptions: <TData = Awaited<ReturnType<typeof getSetupStatus>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSetupStatus>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getSetupStatus>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetSetupStatusQueryResult = NonNullable<Awaited<ReturnType<typeof getSetupStatus>>>;
export type GetSetupStatusQueryError = ErrorType<unknown>;
/**
 * @summary Check whether an administrator exists
 */
export declare function useGetSetupStatus<TData = Awaited<ReturnType<typeof getSetupStatus>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSetupStatus>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateAdministratorUrl: () => string;
/**
 * @summary Create the first administrator
 */
export declare const createAdministrator: (adminSetupInput: AdminSetupInput, options?: Parameters<typeof customFetch>[1]) => Promise<AuthUser>;
export declare const getCreateAdministratorMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createAdministrator>>, TError, {
        data: BodyType<AdminSetupInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createAdministrator>>, TError, {
    data: BodyType<AdminSetupInput>;
}, TContext>;
export type CreateAdministratorMutationResult = NonNullable<Awaited<ReturnType<typeof createAdministrator>>>;
export type CreateAdministratorMutationBody = BodyType<AdminSetupInput>;
export type CreateAdministratorMutationError = ErrorType<ErrorResponse>;
/**
* @summary Create the first administrator
*/
export declare const useCreateAdministrator: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createAdministrator>>, TError, {
        data: BodyType<AdminSetupInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createAdministrator>>, TError, {
    data: BodyType<AdminSetupInput>;
}, TContext>;
export declare const getLoginUrl: () => string;
/**
 * @summary Sign in as an administrator
 */
export declare const login: (loginInput: LoginInput, options?: Parameters<typeof customFetch>[1]) => Promise<AuthUser>;
export declare const getLoginMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
        data: BodyType<LoginInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
    data: BodyType<LoginInput>;
}, TContext>;
export type LoginMutationResult = NonNullable<Awaited<ReturnType<typeof login>>>;
export type LoginMutationBody = BodyType<LoginInput>;
export type LoginMutationError = ErrorType<ErrorResponse>;
/**
* @summary Sign in as an administrator
*/
export declare const useLogin: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
        data: BodyType<LoginInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof login>>, TError, {
    data: BodyType<LoginInput>;
}, TContext>;
export declare const getGetCurrentUserUrl: () => string;
/**
 * @summary Get the current session user
 */
export declare const getCurrentUser: (options?: Parameters<typeof customFetch>[1]) => Promise<AuthUser>;
export declare const getGetCurrentUserQueryKey: () => readonly ["/api/auth/me"];
export declare const getGetCurrentUserQueryOptions: <TData = Awaited<ReturnType<typeof getCurrentUser>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCurrentUser>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getCurrentUser>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetCurrentUserQueryResult = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
export type GetCurrentUserQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get the current session user
 */
export declare function useGetCurrentUser<TData = Awaited<ReturnType<typeof getCurrentUser>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCurrentUser>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getLogoutUrl: () => string;
/**
 * @summary End the current session
 */
export declare const logout: (options?: Parameters<typeof customFetch>[1]) => Promise<MessageResponse>;
export declare const getLogoutMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
export type LogoutMutationResult = NonNullable<Awaited<ReturnType<typeof logout>>>;
export type LogoutMutationError = ErrorType<unknown>;
/**
* @summary End the current session
*/
export declare const useLogout: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
export declare const getUpdateUsernameUrl: () => string;
/**
 * @summary Change the administrator username
 */
export declare const updateUsername: (usernameChangeInput: UsernameChangeInput, options?: Parameters<typeof customFetch>[1]) => Promise<AuthUser>;
export declare const getUpdateUsernameMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateUsername>>, TError, {
        data: BodyType<UsernameChangeInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateUsername>>, TError, {
    data: BodyType<UsernameChangeInput>;
}, TContext>;
export type UpdateUsernameMutationResult = NonNullable<Awaited<ReturnType<typeof updateUsername>>>;
export type UpdateUsernameMutationBody = BodyType<UsernameChangeInput>;
export type UpdateUsernameMutationError = ErrorType<ErrorResponse>;
/**
* @summary Change the administrator username
*/
export declare const useUpdateUsername: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateUsername>>, TError, {
        data: BodyType<UsernameChangeInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateUsername>>, TError, {
    data: BodyType<UsernameChangeInput>;
}, TContext>;
export declare const getUpdatePasswordUrl: () => string;
/**
 * @summary Change the administrator password
 */
export declare const updatePassword: (passwordChangeInput: PasswordChangeInput, options?: Parameters<typeof customFetch>[1]) => Promise<MessageResponse>;
export declare const getUpdatePasswordMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updatePassword>>, TError, {
        data: BodyType<PasswordChangeInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updatePassword>>, TError, {
    data: BodyType<PasswordChangeInput>;
}, TContext>;
export type UpdatePasswordMutationResult = NonNullable<Awaited<ReturnType<typeof updatePassword>>>;
export type UpdatePasswordMutationBody = BodyType<PasswordChangeInput>;
export type UpdatePasswordMutationError = ErrorType<ErrorResponse>;
/**
* @summary Change the administrator password
*/
export declare const useUpdatePassword: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updatePassword>>, TError, {
        data: BodyType<PasswordChangeInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updatePassword>>, TError, {
    data: BodyType<PasswordChangeInput>;
}, TContext>;
export declare const getListPeopleUrl: (params?: ListPeopleParams) => string;
/**
 * @summary List registered people
 */
export declare const listPeople: (params?: ListPeopleParams, options?: Parameters<typeof customFetch>[1]) => Promise<Person[]>;
export declare const getListPeopleQueryKey: (params?: ListPeopleParams) => readonly ["/api/people", ...ListPeopleParams[]];
export declare const getListPeopleQueryOptions: <TData = Awaited<ReturnType<typeof listPeople>>, TError = ErrorType<ErrorResponse>>(params?: ListPeopleParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listPeople>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listPeople>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListPeopleQueryResult = NonNullable<Awaited<ReturnType<typeof listPeople>>>;
export type ListPeopleQueryError = ErrorType<ErrorResponse>;
/**
 * @summary List registered people
 */
export declare function useListPeople<TData = Awaited<ReturnType<typeof listPeople>>, TError = ErrorType<ErrorResponse>>(params?: ListPeopleParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listPeople>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreatePersonUrl: () => string;
/**
 * @summary Register a person
 */
export declare const createPerson: (personInput: PersonInput, options?: Parameters<typeof customFetch>[1]) => Promise<Person>;
export declare const getCreatePersonMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createPerson>>, TError, {
        data: BodyType<PersonInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createPerson>>, TError, {
    data: BodyType<PersonInput>;
}, TContext>;
export type CreatePersonMutationResult = NonNullable<Awaited<ReturnType<typeof createPerson>>>;
export type CreatePersonMutationBody = BodyType<PersonInput>;
export type CreatePersonMutationError = ErrorType<ErrorResponse>;
/**
* @summary Register a person
*/
export declare const useCreatePerson: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createPerson>>, TError, {
        data: BodyType<PersonInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createPerson>>, TError, {
    data: BodyType<PersonInput>;
}, TContext>;
export declare const getImportPeopleUrl: () => string;
/**
 * @summary Import validated Excel rows
 */
export declare const importPeople: (importInput: ImportInput, options?: Parameters<typeof customFetch>[1]) => Promise<ImportResult>;
export declare const getImportPeopleMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof importPeople>>, TError, {
        data: BodyType<ImportInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof importPeople>>, TError, {
    data: BodyType<ImportInput>;
}, TContext>;
export type ImportPeopleMutationResult = NonNullable<Awaited<ReturnType<typeof importPeople>>>;
export type ImportPeopleMutationBody = BodyType<ImportInput>;
export type ImportPeopleMutationError = ErrorType<ErrorResponse>;
/**
* @summary Import validated Excel rows
*/
export declare const useImportPeople: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof importPeople>>, TError, {
        data: BodyType<ImportInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof importPeople>>, TError, {
    data: BodyType<ImportInput>;
}, TContext>;
export declare const getGetPersonUrl: (id: number) => string;
/**
 * @summary Get one person
 */
export declare const getPerson: (id: number, options?: Parameters<typeof customFetch>[1]) => Promise<Person>;
export declare const getGetPersonQueryKey: (id: number) => readonly [`/api/people/${number}`];
export declare const getGetPersonQueryOptions: <TData = Awaited<ReturnType<typeof getPerson>>, TError = ErrorType<ErrorResponse>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPerson>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getPerson>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetPersonQueryResult = NonNullable<Awaited<ReturnType<typeof getPerson>>>;
export type GetPersonQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get one person
 */
export declare function useGetPerson<TData = Awaited<ReturnType<typeof getPerson>>, TError = ErrorType<ErrorResponse>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPerson>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdatePersonUrl: (id: number) => string;
/**
 * @summary Update one person
 */
export declare const updatePerson: (id: number, personUpdate: PersonUpdate, options?: Parameters<typeof customFetch>[1]) => Promise<Person>;
export declare const getUpdatePersonMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updatePerson>>, TError, {
        id: number;
        data: BodyType<PersonUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updatePerson>>, TError, {
    id: number;
    data: BodyType<PersonUpdate>;
}, TContext>;
export type UpdatePersonMutationResult = NonNullable<Awaited<ReturnType<typeof updatePerson>>>;
export type UpdatePersonMutationBody = BodyType<PersonUpdate>;
export type UpdatePersonMutationError = ErrorType<ErrorResponse>;
/**
* @summary Update one person
*/
export declare const useUpdatePerson: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updatePerson>>, TError, {
        id: number;
        data: BodyType<PersonUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updatePerson>>, TError, {
    id: number;
    data: BodyType<PersonUpdate>;
}, TContext>;
export declare const getDeletePersonUrl: (id: number) => string;
/**
 * @summary Delete one person
 */
export declare const deletePerson: (id: number, options?: Parameters<typeof customFetch>[1]) => Promise<void>;
export declare const getDeletePersonMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deletePerson>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deletePerson>>, TError, {
    id: number;
}, TContext>;
export type DeletePersonMutationResult = NonNullable<Awaited<ReturnType<typeof deletePerson>>>;
export type DeletePersonMutationError = ErrorType<ErrorResponse>;
/**
* @summary Delete one person
*/
export declare const useDeletePerson: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deletePerson>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deletePerson>>, TError, {
    id: number;
}, TContext>;
export declare const getGetDashboardSummaryUrl: () => string;
/**
 * @summary Get registration statistics
 */
export declare const getDashboardSummary: (options?: Parameters<typeof customFetch>[1]) => Promise<DashboardSummary>;
export declare const getGetDashboardSummaryQueryKey: () => readonly ["/api/dashboard/summary"];
export declare const getGetDashboardSummaryQueryOptions: <TData = Awaited<ReturnType<typeof getDashboardSummary>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDashboardSummary>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDashboardSummaryQueryResult = NonNullable<Awaited<ReturnType<typeof getDashboardSummary>>>;
export type GetDashboardSummaryQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get registration statistics
 */
export declare function useGetDashboardSummary<TData = Awaited<ReturnType<typeof getDashboardSummary>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListBackupsUrl: () => string;
/**
 * @summary List backup history
 */
export declare const listBackups: (options?: Parameters<typeof customFetch>[1]) => Promise<Backup[]>;
export declare const getListBackupsQueryKey: () => readonly ["/api/backups"];
export declare const getListBackupsQueryOptions: <TData = Awaited<ReturnType<typeof listBackups>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listBackups>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listBackups>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListBackupsQueryResult = NonNullable<Awaited<ReturnType<typeof listBackups>>>;
export type ListBackupsQueryError = ErrorType<ErrorResponse>;
/**
 * @summary List backup history
 */
export declare function useListBackups<TData = Awaited<ReturnType<typeof listBackups>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listBackups>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateBackupUrl: () => string;
/**
 * @summary Record a backup operation
 */
export declare const createBackup: (backupInput: BackupInput, options?: Parameters<typeof customFetch>[1]) => Promise<Backup>;
export declare const getCreateBackupMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createBackup>>, TError, {
        data: BodyType<BackupInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createBackup>>, TError, {
    data: BodyType<BackupInput>;
}, TContext>;
export type CreateBackupMutationResult = NonNullable<Awaited<ReturnType<typeof createBackup>>>;
export type CreateBackupMutationBody = BodyType<BackupInput>;
export type CreateBackupMutationError = ErrorType<ErrorResponse>;
/**
* @summary Record a backup operation
*/
export declare const useCreateBackup: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createBackup>>, TError, {
        data: BodyType<BackupInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createBackup>>, TError, {
    data: BodyType<BackupInput>;
}, TContext>;
export declare const getUploadBackupToGoogleDriveUrl: () => string;
/**
 * @summary Upload a registry backup to Google Drive
 */
export declare const uploadBackupToGoogleDrive: (googleDriveBackupInput: GoogleDriveBackupInput, options?: Parameters<typeof customFetch>[1]) => Promise<Backup>;
export declare const getUploadBackupToGoogleDriveMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof uploadBackupToGoogleDrive>>, TError, {
        data: BodyType<GoogleDriveBackupInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof uploadBackupToGoogleDrive>>, TError, {
    data: BodyType<GoogleDriveBackupInput>;
}, TContext>;
export type UploadBackupToGoogleDriveMutationResult = NonNullable<Awaited<ReturnType<typeof uploadBackupToGoogleDrive>>>;
export type UploadBackupToGoogleDriveMutationBody = BodyType<GoogleDriveBackupInput>;
export type UploadBackupToGoogleDriveMutationError = ErrorType<ErrorResponse>;
/**
* @summary Upload a registry backup to Google Drive
*/
export declare const useUploadBackupToGoogleDrive: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof uploadBackupToGoogleDrive>>, TError, {
        data: BodyType<GoogleDriveBackupInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof uploadBackupToGoogleDrive>>, TError, {
    data: BodyType<GoogleDriveBackupInput>;
}, TContext>;
export {};
//# sourceMappingURL=api.d.ts.map