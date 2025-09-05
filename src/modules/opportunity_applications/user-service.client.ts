import { Injectable } from '@nestjs/common';
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

@Injectable()
export class UserServiceClient {
  constructor(private readonly httpService: HttpService) {}

  async getYouthUsers(headers?: any): Promise<UserData[]> {
    try {
      const url = `${userServiceConfig.baseUrl}${userServiceConfig.endpoints.getYouthList}`;
      
      const response = await firstValueFrom(
        this.httpService.post<YouthListResponse>(url, {
          filters: {
            role: 'Youth',
            status: ['active']
          },
          sort: ['name', 'asc'],
          offset: 0
        }, {
          timeout: userServiceConfig.timeout,
          headers: {
            'Content-Type': 'application/json',
            'tenantid': headers?.['tenantid'] || process.env.USER_SERVICE_TENANT_ID ,
            'Authorization': headers?.['authorization'] || `Bearer ${process.env.USER_SERVICE_AUTH_TOKEN }`
          }
        })
      );
      
      const responseData = response.data as YouthListResponse;
      
      // Check if response has the expected structure
      if (responseData.responseCode === 200 && responseData.result) {
        // Try different possible field names
        const userData = responseData.result.getUserDetails || 
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
      return (response.data as UserData);
    } catch (error) {
      console.error('Error fetching user data:', error);
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
      return (response.data as UserData);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }
} 