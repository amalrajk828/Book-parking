console.log('[DEBUG] configController loading...');
import WebsiteConfig from '../models/WebsiteConfig.js';
console.log('[DEBUG] configController loaded successfully');

// @desc    Get website configuration (Public)
// @route   GET /api/config
// @access  Public
export const getConfig = async (req, res, next) => {
  try {
    let config = await WebsiteConfig.findOne();
    
    // Seed default configuration if none exists
    if (!config) {
      config = await WebsiteConfig.create({});
    }
    
    res.status(200).json({
      success: true,
      data: config
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update website configuration (Admin Only)
// @route   PUT /api/config
// @access  Private/Admin
export const updateConfig = async (req, res, next) => {
  try {
    const updateData = {
      websiteName: req.body.websiteName,
      websiteLogo: req.body.websiteLogo,
      contactEmail: req.body.contactEmail,
      contactPhone: req.body.contactPhone,
      supportAddress: req.body.supportAddress,
      currency: req.body.currency,
      currencySymbol: req.body.currencySymbol,
      themeMode: req.body.themeMode,
      primaryColor: req.body.primaryColor,
      maintenanceMode: req.body.maintenanceMode,
      maintenanceMessage: req.body.maintenanceMessage,
      footerText: req.body.footerText,
      socialLinks: {
        facebook: req.body.socialLinks?.facebook || '',
        instagram: req.body.socialLinks?.instagram || '',
        twitter: req.body.socialLinks?.twitter || '',
        linkedin: req.body.socialLinks?.linkedin || ''
      }
    };

    // Ensure we don't end up with multiple docs by using findOneAndUpdate with an empty filter
    const config = await WebsiteConfig.findOneAndUpdate(
      {},
      updateData,
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Website configuration updated successfully',
      data: config
    });
  } catch (error) {
    next(error);
  }
};
