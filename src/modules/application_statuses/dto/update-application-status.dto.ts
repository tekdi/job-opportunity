import { PartialType } from "@nestjs/mapped-types";
import { CreateApplicationStatusDto } from "./create-application-status.dto";

export class UpdateApplicationStatusDto extends PartialType(
  CreateApplicationStatusDto
) {}
