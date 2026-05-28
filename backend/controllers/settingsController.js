import Settings from '../models/Settings.js';

// @desc    Get website settings (Public)
// @route   GET /api/settings
// @access  Public
export const getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    
    // Seed default settings if none exist
    if (!settings) {
      settings = await Settings.create({});
    }
    
    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update website settings (Admin Only)
// @route   PUT /api/admin/settings
// @access  Private/Admin
export const updateSettings = async (req, res, next) => {
  try {
    const updateData = {
      websiteName: req.body.websiteName,
      logoUrl: req.body.logoUrl,
      primaryColor: req.body.primaryColor,
      footerText: req.body.footerText,
      contactEmail: req.body.contactEmail,
      supportPhone: req.body.supportPhone,
      currency: req.body.currency,
      termsText: req.body.termsText,
      maintenanceMode: req.body.maintenanceMode
    };

    // Ensure we don't end up with multiple docs by using findOneAndUpdate with an empty filter
    const settings = await Settings.findOneAndUpdate(
      {},
      updateData,
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Website settings updated successfully',
      data: settings
    });
  } catch (error) {
    next(error);
  }
};
