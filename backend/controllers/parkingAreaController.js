import ParkingArea from '../models/ParkingArea.js';
import ParkingSlot from '../models/ParkingSlot.js';
import User from '../models/User.js';

// @desc    Create a new parking area & generate slots automatically
// @route   POST /api/areas
// @access  Private/Admin
export const createParkingArea = async (req, res, next) => {
  try {
    const { name, areaId, address, city, vehicleTypes, feePerHour, extraFeePerHour, totalSlots, coordinates } = req.body;

    if (!name || !areaId || !address || !city || !feePerHour || !totalSlots) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // Check if Area ID is already taken
    const areaExists = await ParkingArea.findOne({ areaId: areaId.toUpperCase() });
    if (areaExists) {
      return res.status(400).json({ success: false, message: 'Parking Area ID already exists' });
    }

    const parkingArea = await ParkingArea.create({
      name,
      areaId: areaId.toUpperCase(),
      address,
      city,
      vehicleTypes,
      feePerHour,
      extraFeePerHour: extraFeePerHour !== undefined ? extraFeePerHour : feePerHour,
      totalSlots,
      availableSlots: totalSlots,
      coordinates: coordinates || { lat: 9.9312, lng: 76.2673 },
    });

    // Auto-create Slots (e.g. PK-KOCHI-01-A1, PK-KOCHI-01-A2, ...)
    const slotsToCreate = [];
    for (let i = 1; i <= totalSlots; i++) {
      slotsToCreate.push({
        slotId: `${parkingArea.areaId}-A${i}`,
        area: parkingArea._id,
        status: 'available',
      });
    }
    await ParkingSlot.insertMany(slotsToCreate);

    res.status(201).json({
      success: true,
      message: `Parking Area created successfully and ${totalSlots} slots auto-generated`,
      parkingArea,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all parking areas with filters
// @route   GET /api/areas
// @access  Public
export const getParkingAreas = async (req, res, next) => {
  try {
    const { city, vehicleType, search } = req.query;
    let query = {};

    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }

    if (vehicleType) {
      query.vehicleTypes = vehicleType;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { areaId: { $regex: search, $options: 'i' } },
      ];
    }

    const areas = await ParkingArea.find(query).populate('assignedGuide', 'username email phone');
    res.status(200).json({ success: true, count: areas.length, areas });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single parking area with its slots
// @route   GET /api/areas/:id
// @access  Public
export const getParkingAreaById = async (req, res, next) => {
  try {
    const area = await ParkingArea.findById(req.params.id).populate('assignedGuide', 'username email phone');
    if (!area) {
      return res.status(404).json({ success: false, message: 'Parking Area not found' });
    }

    const slots = await ParkingSlot.find({ area: area._id });

    res.status(200).json({
      success: true,
      area,
      slots,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update parking area details
// @route   PUT /api/areas/:id
// @access  Private/Admin
export const updateParkingArea = async (req, res, next) => {
  try {
    const { name, address, city, vehicleTypes, feePerHour, extraFeePerHour, coordinates } = req.body;
    
    let area = await ParkingArea.findById(req.params.id);
    if (!area) {
      return res.status(404).json({ success: false, message: 'Parking Area not found' });
    }

    area.name = name || area.name;
    area.address = address || area.address;
    area.city = city || area.city;
    area.vehicleTypes = vehicleTypes || area.vehicleTypes;
    area.feePerHour = feePerHour !== undefined ? feePerHour : area.feePerHour;
    area.extraFeePerHour = extraFeePerHour !== undefined ? extraFeePerHour : area.extraFeePerHour;
    if (coordinates) {
      area.coordinates = coordinates;
    }

    await area.save();

    res.status(200).json({
      success: true,
      message: 'Parking Area updated successfully',
      area,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete parking area & remove all associated slots
// @route   DELETE /api/areas/:id
// @access  Private/Admin
export const deleteParkingArea = async (req, res, next) => {
  try {
    const area = await ParkingArea.findById(req.params.id);
    if (!area) {
      return res.status(404).json({ success: false, message: 'Parking Area not found' });
    }

    // Delete all associated slots
    await ParkingSlot.deleteMany({ area: area._id });
    
    // Remove guide assignments referring to this area
    await User.updateMany({ assignedArea: area._id }, { $set: { assignedArea: null } });

    // Use deleteOne() or findByIdAndDelete()
    await ParkingArea.findByIdAndDelete(area._id);

    res.status(200).json({
      success: true,
      message: 'Parking Area and all its slots deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign guide to parking area
// @route   PUT /api/areas/:id/assign-guide
// @access  Private/Admin
export const assignGuide = async (req, res, next) => {
  try {
    const { guideId } = req.body;
    
    const area = await ParkingArea.findById(req.params.id);
    if (!area) {
      return res.status(404).json({ success: false, message: 'Parking Area not found' });
    }

    if (!guideId) {
      // Clear current guide
      if (area.assignedGuide) {
        await User.findByIdAndUpdate(area.assignedGuide, { assignedArea: null });
      }
      area.assignedGuide = null;
      await area.save();
      return res.status(200).json({ success: true, message: 'Assigned guide removed', area });
    }

    const guide = await User.findById(guideId);
    if (!guide || guide.role !== 'guide') {
      return res.status(400).json({ success: false, message: 'Invalid Parking Guide ID' });
    }

    // Free guide from any existing assigned area
    if (guide.assignedArea) {
      await ParkingArea.findByIdAndUpdate(guide.assignedArea, { assignedGuide: null });
    }

    // Unassign old guide from this area if exists
    if (area.assignedGuide) {
      await User.findByIdAndUpdate(area.assignedGuide, { assignedArea: null });
    }

    // Setup new assignment
    area.assignedGuide = guide._id;
    guide.assignedArea = area._id;

    await area.save();
    await guide.save();

    res.status(200).json({
      success: true,
      message: `Guide ${guide.username} successfully assigned to ${area.name}`,
      area,
    });
  } catch (error) {
    next(error);
  }
};
