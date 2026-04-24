import { dataValidation } from "@/common/infrastructure/validation/zod";
import { SearchOrderUseCase } from "@/orders/application/usecases/search-order.usecase";
import { Request, Response } from "express";
import { container } from "tsyringe";
import { z } from "zod";

export async function searchOrderController(
  request: Request,
  response: Response,
): Promise<Response> {
  const querySchema = z.object({
    page: z.coerce.number().optional(),
    per_page: z.coerce.number().optional(),
    sort: z.string().optional(),
    sort_dir: z.string().optional(),
    filter: z.string().optional(),
  });

  const { page, per_page, sort, sort_dir, filter } = dataValidation(
    querySchema,
    request.query,
  );

  const searchOrderUseCase: SearchOrderUseCase.UseCase = container.resolve(
    "SearchOrderUseCase",
  );

  const orders = await searchOrderUseCase.execute({
    page: page ?? 1,
    per_page: per_page ?? 15,
    sort: sort ?? null,
    sort_dir: sort_dir ?? null,
    filter: filter ?? null,
  });

  return response.status(200).json(orders);
}
