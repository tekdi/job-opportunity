import "reflect-metadata"; // Must be at the very top!
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { RequestMethod } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("opportunity-service/", {
    exclude: [{ path: "health", method: RequestMethod.GET }],
  });
  await app.listen(process.env.PORT || 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
