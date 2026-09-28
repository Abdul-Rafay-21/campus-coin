import { Router } from "express";
import { z } from "zod";
import { TipTemplate } from "../../models/models.js";
import { route, AppError } from "../../helpers/utils.js";
import { log } from "./activityLog.js";

const router = Router();

router.get(

  "/templates",

  route(async (_req, res) =>

    res.json({

      templates: await TipTemplate.find().sort({
        createdAt: -1,
      }
    ),
    }
    ),
  ),
);


router.post(

  "/templates",
 
  route(async (req, res) => 
    {
    
    const data = z
      .object({
        title: z.string().trim().min(2).max(100),
        body: z.string().trim().min(2).max(1000),
        kind: z.enum(["tip", "insight"]).optional(),
        active: z.boolean().optional(),
      }
      )
     
      .parse(req.body);
    
      const item = await TipTemplate.create(data);
      await log(req, "tip-template.create", item._id);
      res.status(201).json({
  
      template: item,
    }
  );
  }
),
);
router.patch(
 
  "/templates/:id",
 
  route(async (req, res) => {
 
    const data = z
 
    .object({
 
      title: z.string().trim().min(2).max(100).optional(),
 
      body: z.string().trim().min(2).max(1000).optional(),
      kind: z.enum(["tip", "insight"]).optional(),
      
      active: z.boolean().optional(),
      }
    )
    
      .parse(req.body);
    
      const item = await TipTemplate.findByIdAndUpdate(
     
        req.params.id,
     
        {
        $set: data,
      },

      
      {
        new: true,
      },
    );

    
    if (!item) throw new AppError(404, "Template not found.");
    
    await log(req, "tip-template.update", item._id);
    res.json({
    
      template: item,
    }
  );
  }
),
);


router.delete(

  "/templates/:id",

  route(async (req, res) => {

    const item = await TipTemplate.findByIdAndDelete(req.params.id);

    if (!item) throw new AppError(404, "Template not found.");

    await log(req, "tip-template.delete", item._id);

    res.json({

      message: "Template deleted.",

    }
    );
  }
  ),
);
export default router;
