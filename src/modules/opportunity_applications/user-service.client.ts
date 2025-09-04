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

  async getYouthUsers(): Promise<UserData[]> {
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
            'tenantid': process.env.USER_SERVICE_TENANT_ID || 'ef99949b-7f3a-4a5f-806a-e67e683e38f3',
            'Authorization': `Bearer ${process.env.USER_SERVICE_AUTH_TOKEN || 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJKQWV0Z1E5d1c1X1ktaHBwV0lsb3pxb0ExZ3ctNnhvMi1MVzExNjlSblljIn0.eyJleHAiOjE3NTY4MTA2MDYsImlhdCI6MTc1NjcyNDIwNiwianRpIjoiMDU0ZDM1ZDEtNGNlNC00NmFlLWE0N2EtNTczMzI2YTY1MzhhIiwiaXNzIjoiaHR0cHM6Ly9rZXljbG9hay1kZXYuYXNwaXJlbGVhZGVycy5vcmcvYXV0aC9yZWFsbXMvQXNwaXJlTGVhZGVyRGV2Iiwic3ViIjoiMTAwYmE3NzctY2E5OS00Y2VhLThlYzctYzFkZGQ3NjNkOTdiIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoiQXNwaXJlTGVhZGVyRGV2Iiwic2Vzc2lvbl9zdGF0ZSI6IjM3NTYwMGQ1LTZjNzktNDgzOS05ZTI1LTQxYzBlM2MyNDU0NyIsImFjciI6IjEiLCJhbGxvd2VkLW9yaWdpbnMiOlsiLyoiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iLCJkZWZhdWx0LXJvbGVzLXByYXRoYW0iXX0sInNjb3BlIjoic3NvLW1ldGFkYXRhIGVtYWlsIHByb2ZpbGUgcHJhdGhhbS1yb2xlIiwic2lkIjoiMzc1NjAwZDUtNmM3OS00ODM5LTllMjUtNDFjMGUzYzI0NTQ3IiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJuYW1lIjoiRG55YW5lc2ggIEsiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJkbnlhbmVzaGtAeW9wbWFpbC5jb20iIiwiZ2l2ZW5fbmFtZSI6IkRueWFuZXNoICIsImZhbWlseV9uYW1lIjoiSyIsImVtYWlsIjoiZG55YW5lc2hrQHlvcG1haWwuY29tIn0.ZYnj5Vw-PNmFstmh2cHifoMsJ_DLvjvNpzDWS8QQ_gQknOr63yqZwlou8JpplsgewAq2Bnat3AKT6tBx_1FlJKHQYlytHZZvCbUnq3iNVZOQFhjjAu453K-RjxsXs_JfAPYg4GfA_mMSRvD_MVVXooe7Sf7eAaCo5uoyaWsLnAJKrURZOsYRJcboBhJRt2X--oalW28iBteyVwh_jzzBO4-VDn0eEevhdjJHAOfKE6ZzULp7S3kWaeWX72Te_p3_UfN7OHkIwbGUjaHmku3OhpFivz2JLP3Ydf0RtmeQm4LMk39UACzx0m1Fvcj13HPGozKdSCm5Km7IEzuX-qaLMEw'}`
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