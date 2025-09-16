import { ApiProperty } from '@nestjs/swagger';

export class OpportunityApplicationReportDto {
  @ApiProperty({ description: 'First Name' })
  firstName?: string;

  @ApiProperty({ description: 'Middle Name' })
  middleName?: string;

  @ApiProperty({ description: 'Last Name' })
  lastName?: string;

  @ApiProperty({ description: 'Country' })
  country?: string;

  @ApiProperty({ description: 'County' })
  county?: string;

  @ApiProperty({ description: 'Sub-County' })
  subCounty?: string;

  @ApiProperty({ description: 'Email ID' })
  emailId?: string;

  @ApiProperty({ description: 'Phone Number' })
  phoneNumber?: string;

  @ApiProperty({ description: 'Age' })
  age?: number;

  @ApiProperty({ description: 'Gender' })
  gender?: string;

  @ApiProperty({ description: 'Highest Education Qualification' })
  highestEducationQualification?: string;

  @ApiProperty({ description: 'Center Name' })
  centerName?: string;

  @ApiProperty({ description: 'TVETs Enrollment Number' })
  tvetsEnrollmentNumber?: string;

  @ApiProperty({ description: 'Courses' })
  courses?: string[];

  @ApiProperty({ description: 'Pass Year' })
  passYear?: number;

  @ApiProperty({ description: 'Company Name' })
  companyName?: string;

  @ApiProperty({ description: 'Title' })
  title?: string;

  @ApiProperty({ description: 'Description' })
  description?: string;

  @ApiProperty({ description: 'Opportunity Type' })
  opportunityType?: string;

  @ApiProperty({ description: 'Experience Level' })
  experienceLevel?: string;

  @ApiProperty({ description: 'Salary' })
  salary?: number;

  @ApiProperty({ description: 'Industry Name' })
  industryName?: string;

  @ApiProperty({ description: 'Industry Location' })
  industryLocation?: string;

  @ApiProperty({ description: 'Status' })
  status?: string;

  @ApiProperty({ description: 'Date of Joining (for job)' })
  doj?: Date;

  @ApiProperty({ description: 'Start date for attachment' })
  startDateForAttachment?: Date;

  @ApiProperty({ description: 'End date for attachment' })
  endDateForAttachment?: Date;

  @ApiProperty({ description: 'Benefits' })
  benefits?: string[];

  @ApiProperty({ description: 'Other Benefits' })
  otherBenefits?: string;

  @ApiProperty({ description: 'Work Mode' })
  workMode?: string;

  @ApiProperty({ description: 'Offer Letter Provided' })
  offerLetterProvided?: boolean;

  @ApiProperty({ description: 'Rejection Reason' })
  rejectionReason?: string;

  @ApiProperty({ description: 'Created By User ID' })
  createdBy?: string;

  @ApiProperty({ description: 'Updated By User ID' })
  updatedBy?: string;
} 