import express from 'express';

const router = express.Router();

// POST /api/analysis/estimate - Calculate carbon potential estimates without saving
router.post('/estimate', async (req, res) => {
  try {
    const { hectares, tech_type, gps_boundary } = req.body;

    if (!hectares || !tech_type) {
      return res.status(400).json({ error: 'Missing required fields: hectares and tech_type' });
    }

    const hectaresNum = parseFloat(hectares);
    if (isNaN(hectaresNum) || hectaresNum <= 0) {
      return res.status(400).json({ error: 'Invalid hectares value' });
    }

    // Deterministic calculation based on technology type
    let removalPerHectare = 0;
    const techTypeLower = tech_type.toLowerCase();
    
    if (techTypeLower.includes('biochar')) {
      removalPerHectare = 50; // tonnes CO₂ per hectare
    } else if (techTypeLower.includes('enhanced rock weathering') || techTypeLower.includes('erw')) {
      removalPerHectare = 25; // tonnes CO₂ per hectare
    } else if (techTypeLower.includes('afforestation') || techTypeLower.includes('reforestation') || techTypeLower.includes('a/r')) {
      removalPerHectare = 30; // tonnes CO₂ per hectare
    } else {
      removalPerHectare = 40; // Default fallback
    }

    // Calculate estimates
    const estimatedRemoval = Math.round(hectaresNum * removalPerHectare);
    const creditPrice = 150; // USD per tonne CO₂
    const estimatedRevenue = estimatedRemoval * creditPrice;
    const upfrontCost = Math.round(hectaresNum * 500); // $500 per hectare

    res.json({
      success: true,
      estimates: {
        removal: estimatedRemoval,
        revenue: estimatedRevenue,
        cost: upfrontCost,
      },
      techType: tech_type,
      hectares: hectaresNum,
    });
  } catch (error: any) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Analysis failed', details: error.message });
  }
});

export default router;

