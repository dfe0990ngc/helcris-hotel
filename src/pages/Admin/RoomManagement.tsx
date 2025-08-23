import React, { useState, useEffect, useRef } from 'react';
import { rooms as apiRooms, createRoom, updateRoom, updateRoomImage, deleteRoom } from '../../api/api.js';
import { Room } from '../../types';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { Plus, Edit, Trash2, Wifi, Tv, Wind, Bath, Coffee, Car, Utensils, Bed, Users, CakeSlice, Heater, HardHat, PanelsLeftBottomIcon, PanelBottom, EditIcon, UploadCloud, MoonStar } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.js';

const amenityIcons: { [key: string]: React.ComponentType<{ className?: string }> } = {
  'WiFi': Wifi,
  'TV': Tv,
  'Air Conditioning': Wind,
  'Bathroom': Bath,
  'Mini Bar': Coffee,
  'Parking': Car,
  'Room Service': Utensils,
  'Balcony': PanelBottom,
  'Living Room': PanelsLeftBottomIcon,
  'Kitchen': CakeSlice,
  'Jacuzzi': Heater,
  'Butler Service': HardHat,
};

const amenityList = [
  'WiFi',
  'TV',
  'Air Conditioning',
  'Bathroom',
  'Mini Bar',
  'Parking',
  'Room Service',
  'Balcony',
  'Living Room',
  'Kitchen',
  'Jacuzzi',
  'Butler Service',
];

const RoomManagement: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const [showImageUrlModal, setShowImageUrlModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [imageUrl, setImageUrl] = useState('');

  const [statusFilter,setStatusFilter] = useState('');

  const { logout } = useAuth();

  const [formData, setFormData] = useState({
    number: '',
    type: 'Standard' as Room['type'],
    price_per_night: 0,
    capacity: 1,
    amenities: [] as string[],
    description: '',
    images: [''],
    status: 'Available' as Room['status'],
    floor: 1,
  });

  const roomsRef = useRef(null);

  useEffect(() => {
    if(!roomsRef.current){
      roomsRef.current = true;
      fetchRooms();
    }
  }, []);

  const fetchRooms = async () => {
    try {
      const { data } = await apiRooms();
      setRooms(data);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Error fetching rooms');

      if(error?.response?.data?.message === 'Unauthenticated.'){
        logout();
      }

    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);
    try {
      if (editingRoom) {
        const {data} = await updateRoom(editingRoom.id, formData);
        toast.success(data?.message || 'Room updated successfully');
      } else {
        const {data} = await createRoom(formData);
        toast.success(data?.message || 'Room created successfully');
      }
      setShowModal(false);
      setEditingRoom(null);
      resetForm();
      fetchRooms();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Error saving room');
    }finally{
      setSaving(false);
    }
  };

  const handleImageUpdate = (room: Room) => {
    setSelectedRoom(room);

    setImageUrl(room?.images?.join(''));
    setShowImageUrlModal(true);
  };

  const handleUpdateImageUrl = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);
    try {
      if (selectedRoom) {
        const {data} = await updateRoomImage(selectedRoom.id, {url: imageUrl});
        toast.success(data?.message || 'Image updated successfully');
      
        setRooms((prev) => prev.map(room => {
          if(room.id === data?.room?.id){
            room.images = data?.room?.images || [];
          }

          return room;
        }));
      }
      
      setShowImageUrlModal(false);
      setSelectedRoom(null);
      setImageUrl('');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Error uploading image');
    } finally{
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      setLoading(true);

      try {
        const { data } = await deleteRoom(id);
        toast.success(data?.message || 'Room deleted successfully');
        fetchRooms();
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Error deleting room');
      }finally{
        setLoading(false);
      }
    }
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      number: room.number,
      type: room.type,
      price_per_night: room.price_per_night,
      capacity: room.capacity,
      amenities: room.amenities,
      description: room.description,
      images: room.images,
      status: room.status,
      floor: room.floor,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      number: '',
      type: 'Standard',
      price_per_night: 0,
      capacity: 1,
      amenities: [],
      description: '',
      images: [''],
      status: 'Available',
      floor: 1,
    });
  };

  const getStatusColor = (status: Room['status']) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800';
      case 'Occupied': return 'bg-red-100 text-red-800';
      case 'Maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoomTypeColor = (type: Room['type']) => {
    switch (type) {
      case 'Standard': return 'bg-blue-100 text-blue-800';
      case 'Deluxe': return 'bg-purple-100 text-purple-800';
      case 'Suite': return 'bg-indigo-100 text-indigo-800';
      case 'Presidential': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {loading && <LoadingSpinner/>}
      <div className="flex sm:flex-row flex-col justify-start sm:justify-between items-start sm:items-center">
        <h1 className="font-bold text-gray-900 text-3xl">Room Management</h1>
        <div className="flex justify-between sm:justify-end items-end sm:items-center gap-x-2 mt-4 sm:mt-0 w-full sm:w-auto">
          <div className="flex sm:flex-row flex-col justify-end sm:justify-end items-start sm:items-baseline gap-x-2">
            <label className="block mb-1 w-32 font-medium text-gray-700 text-sm">
              Filter Status:
            </label>
            <select name="filterStatus" id="filterStatus" onChange={(e) => setStatusFilter(e.target.value)} value={statusFilter} className="px-3 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:ring-[#008ea2] focus:ring-2 w-full">
              <option value="">All</option>
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 bg-[#008ea2] hover:bg-[#006b7a] px-4 py-2 rounded-lg text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Room</span>
          </button>
        </div>
      </div>

      {/* Room Grid */}
      <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {rooms.filter(room => statusFilter === '' ? true : room.status === statusFilter).map((room) => (
          <div key={room.id} className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
            <div className="relative bg-gray-200 h-48">
              <span onClick={() => handleImageUpdate(room)} title="Update Image URL" className="top-4 right-4 absolute bg-indigo-100 p-1 rounded-full text-indigo-800 hover:scale-110 transition-all cursor-pointer">
                <EditIcon className="rounded-full w-4 h-4"/>
              </span>
              {room.images[0] && (
                <img
                  src={room.images[0]}
                  alt={`Room ${room.number}`}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="top-4 left-4 absolute flex space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(room.status)}`}>
                  {room.status}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoomTypeColor(room.type)}`}>
                  {room.type}
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-900 text-lg">Room {room.number}</h3>
                <span className="font-bold text-[#008ea2] text-2xl">₱{room.price_per_night}</span>
              </div>
              
              <p className="mb-4 text-gray-600 text-sm">{room.description}</p>

              {+room?.amenities?.length > 0 && 
                <div className="mb-4">
                  <p className="mb-2 font-medium text-gray-700 text-sm">Amenities:</p>
                  <div className="flex flex-wrap gap-2">
                    {room.amenities.slice(0, 4).map((amenity) => {
                      const IconComponent = amenityIcons[amenity] || Wind;
                      return (
                        <div key={amenity} className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-full text-gray-600 text-xs">
                          <IconComponent className="w-3 h-3" />
                          <span>{amenity}</span>
                        </div>
                      );
                    })}
                    {room.amenities.length > 4 && (
                      <div title={room.amenities.slice(4).join(', ')} className="bg-gray-100 px-2 py-1 rounded-full text-gray-500 text-xs">
                        +{room.amenities.length - 4} more
                      </div>
                    )}
                  </div>
                </div>}
              
              <div className="flex items-center space-x-4 mb-4 text-gray-500 text-sm">
                <div className="flex items-center space-x-1">
                  <Bed className="w-4 h-4" />
                  <span>Floor {room.floor}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{room.capacity} guests</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MoonStar className="w-4 h-4" />
                  <span>per night</span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(room)}
                  className="flex flex-1 justify-center items-center space-x-1 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg text-gray-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(room.id)}
                  className="flex flex-1 justify-center items-center space-x-1 bg-red-100 hover:bg-red-200 px-3 py-2 rounded-lg text-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="-top-[25px] z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <h2 className="mb-4 font-bold text-gray-900 text-xl">
              {editingRoom ? 'Edit Room' : 'Add New Room'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium text-gray-700 text-sm">
                  Room Number
                </label>
                <input
                  disabled={!!editingRoom}
                  type="text"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  className="px-3 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:ring-[#008ea2] focus:ring-2 w-full"
                  required
                />
              </div>
              
              <div>
                <label className="block mb-1 font-medium text-gray-700 text-sm">
                  Room Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Room['type'] })}
                  className="px-3 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:ring-[#008ea2] focus:ring-2 w-full"
                >
                  <option value="Standard">Standard</option>
                  <option value="Deluxe">Deluxe</option>
                  <option value="Suite">Suite</option>
                  <option value="Presidential">Presidential</option>
                </select>
              </div>
              
              <div className="gap-4 grid grid-cols-2">
                <div>
                  <label className="block mb-1 font-medium text-gray-700 text-sm">
                    Price per Night (₱)
                  </label>
                  <input
                    type="number"
                    value={formData.price_per_night}
                    onChange={(e) => setFormData({ ...formData, price_per_night: Number(e.target.value) })}
                    className="px-3 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:ring-[#008ea2] focus:ring-2 w-full"
                    required
                  />
                </div>
                
                <div>
                  <label className="block mb-1 font-medium text-gray-700 text-sm">
                    Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="px-3 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:ring-[#008ea2] focus:ring-2 w-full"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block mb-1 font-medium text-gray-700 text-sm">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="px-3 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:ring-[#008ea2] focus:ring-2 w-full"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-gray-700 text-sm">
                  Amenities
                </label>
                <div className="flex flex-wrap justify-start gap-x-6 gap-y-5 bg-gray-100 px-4 py-3 rounded-lg text-gray-700 text-sm">
                  {amenityList.map((item, index) => {
                    const IconComponent = amenityIcons[item] || Wind;
                    
                    return <>
                      <label key={item} htmlFor={'am'+index} className="flex justify-start items-center gap-x-1">
                        <input onChange={(e) => {
                          if(e.target.checked){
                            setFormData((prev) => ({...prev,amenities:[...prev.amenities,e.target.value]}));
                          }else{
                            setFormData((prev) => ({...prev,amenities:[...prev.amenities.filter(v => v !== e.target.value)]}));
                          }
                        }} type="checkbox" className="rounded-full" name={'am'+index} id={'am'+index} value={item} checked={formData?.amenities?.includes(item) || false} />
                        <IconComponent className="w-3 h-3" />
                        <span>{item}</span>
                      </label>
                    </>
                  })}
                  
                </div>
              </div>
              
              <div className="gap-4 grid grid-cols-2">
                <div>
                  <label className="block mb-1 font-medium text-gray-700 text-sm">
                    Floor
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: Number(e.target.value) })}
                    className="px-3 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:ring-[#008ea2] focus:ring-2 w-full"
                    required
                  />
                </div>
                
                <div>
                  <label className="block mb-1 font-medium text-gray-700 text-sm">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Room['status'] })}
                    className="px-3 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:ring-[#008ea2] focus:ring-2 w-full"
                  >
                    <option value="Available">Available</option>
                    <option value="Occupied">Occupied</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingRoom(null);
                    resetForm();
                  }}
                  className="flex-1 hover:bg-gray-50 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 transition-colors"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 bg-[#008ea2] hover:bg-[#006b7a] px-4 py-2 rounded-lg text-white transition-colors ${saving ? 'cursor-not-allowed opacity-70' : ''}`}
                  disabled={saving}
                >
                  {editingRoom ? (saving ? 'Updating...' : 'Update') : (saving ? 'Creating...' : 'Create')} Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageUrlModal && (
        <div className="-top-[25px] z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="mb-4 font-bold text-gray-900 text-xl">Update Image URL</h2>
            
            <form onSubmit={handleUpdateImageUrl} className="space-y-4">
              
                <div className="w-full">
                  <label htmlFor="url" className="block mb-2 font-medium text-gray-700 text-sm">Image URL</label>
                  <input
                  type="url"
                  id="url"
                  name="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="px-4 py-3 border border-gray-300 focus:border-transparent rounded-lg focus:ring-[#008ea2] focus:ring-2 w-full transition-all"
                  placeholder="Enter Image URL"
                  required
                  />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowImageUrlModal(false);
                    setSelectedRoom(null);
                    setImageUrl('');
                  }}
                  className="flex-1 hover:bg-gray-50 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 transition-colors"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 bg-[#008ea2] hover:bg-[#006b7a] px-4 py-2 rounded-lg text-white transition-colors ${saving ? 'cursor-not-allowed opacity-75' : ''}`}
                  disabled={saving}
                >{saving ? 'Submitting...' : 'Submit'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomManagement;