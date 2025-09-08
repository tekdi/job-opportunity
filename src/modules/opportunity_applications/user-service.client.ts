import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { userServiceConfig } from '../../config/user-service.config';

interface UserData {
  userId: string;
  username?: string;
  email?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  mobile?: string;
  gender?: string;
  dob?: string;
  role?: string;
  status?: string;
  customFields?: Array<{
    fieldId: string;
    label: string;
    value: string;
    code: string;
    type: string;
  }>;
}

interface YouthListResponse {
  id: string;
  ver: string;
  ts: string;
  params: {
    resmsgid: string;
    status: string;
    err: any;
    errmsg: any;
    successmessage: string;
  };
  responseCode: number;
  result: {
    totalCount: number;
    getUserDetails: UserData[];
  };
}

interface CohortResponse {
  id: string;
  ver: string;
  ts: string;
  params: {
    resmsgid: string;
    status: string;
    err: any;
    errmsg: any;
    successmessage: string;
  };
  responseCode: number;
  result: Array<{
    cohortName: string;
    cohortId: string;
    parentID: string;
    cohortMemberStatus: string;
    cohortMembershipId: string;
    cohortStatus: string;
    type: string;
    childData: any[];
  }>;
}

@Injectable()
export class UserServiceClient {
  private readonly logger = new Logger(UserServiceClient.name);

  constructor(private readonly httpService: HttpService) {}

  async getYouthUsers(headers?: any): Promise<UserData[]> {
    try {
      const url = `${userServiceConfig.baseUrl}${userServiceConfig.endpoints.getYouthList}`;

      const response = await firstValueFrom(
        this.httpService.post<YouthListResponse>(
          url,
          {
            filters: {
              role: 'Youth',
              status: ['active'],
            },
            sort: ['name', 'asc'],
            offset: 0,
          },
          {
            timeout: userServiceConfig.timeout,
            headers: {
              'Content-Type': 'application/json',
              Authorization:
                headers?.['authorization'] ||
                `Bearer ${process.env.USER_SERVICE_AUTH_TOKEN}`,
            },
          }
        )
      );

      const responseData = (response as any).data as YouthListResponse;

      // Check if response has the expected structure
      if (responseData.responseCode === 200 && responseData.result) {
        // Try different possible field names
        const userData =
          responseData.result.getUserDetails ||
          (responseData.result as any).users ||
          (responseData.result as any).data ||
          (responseData.result as any).content;

        if (userData && Array.isArray(userData) && userData.length > 0) {
          return userData;
        }
      }

      return [];
    } catch (error) {
      return [];
    }
  }

  async getUserById(userId: string): Promise<UserData | null> {
    try {
      const url = `${userServiceConfig.baseUrl}${userServiceConfig.endpoints.getUser}/${userId}`;
      const response = await firstValueFrom(
        this.httpService.get<UserData>(url, {
          timeout: userServiceConfig.timeout,
        })
      );
      return (response as any).data as UserData;
    } catch (error) {
      this.logger.error('Error fetching user data:', error);
      return null;
    }
  }

  async getUserProfile(userId: string): Promise<UserData | null> {
    try {
      const url = `${userServiceConfig.baseUrl}${userServiceConfig.endpoints.getUserProfile}/${userId}`;
      const response = await firstValueFrom(
        this.httpService.get<UserData>(url, {
          timeout: userServiceConfig.timeout,
        })
      );
      return (response as any).data as UserData;
    } catch (error) {
      this.logger.error('Error fetching user profile:', error);
      return null;
    }
  }

  async getUserCohort(userId: string, headers?: any): Promise<string | null> {
    try {
      // Use the cohort service base URL from environment variables
      const url = `${userServiceConfig.baseUrl}${userServiceConfig.endpoints.getCohort}/${userId}?children=true`;

      const response = await firstValueFrom(
        this.httpService.get<CohortResponse>(url, {
          timeout: userServiceConfig.timeout,
          headers: {
            Accept: 'application/json, text/plain, */*',
            Authorization:
              headers?.['authorization'] ||
              `Bearer ${process.env.USER_SERVICE_AUTH_TOKEN}`,
            tenantid:
              headers?.['tenantid'] ||
              process.env.TENANT_ID ||
              'ef99949b-7f3a-4a5f-806a-e67e683e38f3',
            academicyearid:
              headers?.['academicyearid'] ||
              process.env.ACADEMIC_YEAR_ID ||
              '9a9e0daa-50dd-4d0e-8d10-36e7bc808f88',
            'Content-Type': 'application/json',
          },
        })
      );

      const responseData = (response as any).data as CohortResponse;

      if (
        responseData.responseCode === 200 &&
        responseData.result &&
        Array.isArray(responseData.result)
      ) {
        // Find the first active cohort
        const activeCohort = responseData.result.find(
          (cohort) => cohort.cohortMemberStatus === 'active'
        );

        if (activeCohort) {
          return activeCohort.cohortName;
        }
      }

      return null;
    } catch (error: any) {
      // Only log actual errors, not expected 400 responses (user not in academic year, etc.)
      if (error?.response?.status !== 400) {
        this.logger.error(
          `Error fetching user cohort for userId ${userId}:`,
          error
        );
      }
      return null;
    }
  }
}
