import { Module } from "@nestjs/common";
import { CreateProfessionalController } from "./controllers/create-professional.controller";
import { AuthenticateController } from "./controllers/authenticate.controller";
import { CreateEstablishmentController } from "./controllers/create-establishment.controller";
import { AuthModule } from "../auth/auth.module";
import { DatabaseModule } from "../database/database.module";
import { RecoverUserDataController } from "./controllers/recover-user-data.controller";
import { GetEstablishmentController } from "./controllers/get-establishment.controller";
import { DeactivateEstablishmentController } from "./controllers/deactivate-establishment.controller";
import { CreateUnityController } from "./controllers/create-unity.controller";
import { GetUnityController } from "./controllers/get-unity.controller";
import { DeactivateUnityController } from "./controllers/deactivate-unity.controller";
import { UpdateUnityController } from "./controllers/update-unity.controller";
import { GetUnitsFromEstablishmentController } from "./controllers/get-units-from-establishment.controller";
import { GetProfessionalController } from "./controllers/get-professional.controller";
import { DeactivateProfessionalController } from "./controllers/deactivate-professional.controller";
import { CreateEstablishmentTypeController } from "./controllers/create-establishment-type.controller";
import { CreateRegionalDocumentTypeController } from "./controllers/create-regional-document-type.controller";
import { GetEstablishmentTypeController } from "./controllers/get-establishment-type.controller";
import { GetRegionalDocumentTypeController } from "./controllers/get-regional-document-type.controller";
import { DeactivateEstablishmentTypeController } from "./controllers/deactivate-establishment-type.controller";
import { DeactivateRegionalDocumentTypeController } from "./controllers/deactivate-regional-document-type.controller";
import { UpdateEstablishmentTypeController } from "./controllers/update-establishment-type.controller";
import { UpdateRegionalDocumentTypeController } from "./controllers/update-regional-document-type.controller";
import { CreateCustomerController } from "./controllers/create-customer.controller";
import { GetCustomerController } from "./controllers/get-customer.controller";
import { CreateMedicineController } from "./controllers/create-medicine.controller";
import { UpdateProfessionalController } from "./controllers/update-professional.controller";
import { GetMedicinesController } from "./controllers/get-medicine.controller";
import { CreatePrescriptionController } from "./controllers/create-prescription.controller";
import { GetPrescriptionController } from "./controllers/get-prescription.controller";
import { GetPrescriptionPdfController } from "./controllers/prescription/get-prescription-pdf.controller";
import { PrescriptionService } from "./controllers/prescription/prescription.service";
import { GetDashboardsController } from "./controllers/get-dashboard.controller";
import { DeactivateCustomerController } from "./controllers/deactivate-customer.controller";
import { UpdateCustomerController } from "./controllers/update-customer.controller";
import { GetPetController } from "./controllers/get-pet.controller";
import { DeactivatePetController } from "./controllers/deactivate-pet.controller";

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [
    CreateProfessionalController,
    AuthenticateController,
    CreateEstablishmentController,
    RecoverUserDataController,
    GetEstablishmentController,
    DeactivateEstablishmentController,
    CreateUnityController,
    GetUnityController,
    DeactivateUnityController,
    UpdateUnityController,
    GetUnitsFromEstablishmentController,
    GetProfessionalController,
    DeactivateProfessionalController,
    CreateEstablishmentTypeController,
    CreateRegionalDocumentTypeController,
    GetEstablishmentTypeController,
    GetRegionalDocumentTypeController,
    DeactivateEstablishmentTypeController,
    DeactivateRegionalDocumentTypeController,
    UpdateEstablishmentTypeController,
    UpdateRegionalDocumentTypeController,
    CreateCustomerController,
    GetCustomerController,
    CreateMedicineController,
    UpdateProfessionalController,
    GetMedicinesController,
    CreatePrescriptionController,
    GetPrescriptionController,
    GetPrescriptionPdfController,
    GetDashboardsController,
    DeactivateCustomerController,
    UpdateCustomerController,
    GetPetController,
    DeactivatePetController,
  ],
  providers: [PrescriptionService],
})
export class HttpModule {}
