import { InferSchemaType } from "mongoose";
import { CaseSchema } from "../models/case.model";


export type Case = InferSchemaType<typeof CaseSchema>
