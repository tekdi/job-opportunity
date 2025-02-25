import { Opportunity } from "../entities/opportunity.entity";

export class OpportunityResponseDto extends Opportunity {
  skillDetails: { id: string; name: string }[] | undefined; // Include skills with names
}
