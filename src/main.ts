import "reflect-metadata"; // Must be at the very top!
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { RequestMethod } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("opportunity-service/", {
    exclude: [{ path: "health", method: RequestMethod.GET }],
  });

  // Enable Swagger
  const config = new DocumentBuilder()
    .setTitle("Opportunities API")
    .setDescription("API documentation for job opportunities")
    .setVersion("1.0")
    .addServer("http://localhost:3001") // Use HTTPS if needed
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  await app.listen(process.env.PORT || 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
