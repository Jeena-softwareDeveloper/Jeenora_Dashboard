import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getPoints, updatePoints, clearMessages } from '../../../store/Reducers/Awareness/pointsReducer'
import { Edit, Save, X, Loader } from 'lucide-react'
import toast from 'react-hot-toast'

const Points = () => {
  const dispatch = useDispatch()
  const { points, loader, success, error } = useSelector((state) => state.awarenessPoints)
  
  const [formData, setFormData] = useState({
    members: 0,
    guides: 0,
    farmersHelped: 0,
    expertAdvisors: 0,
    success: 0,
    localFarmersSupport: 0,
    localCommunity: 0,
    localSources: 0,
  })
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    dispatch(getPoints())
  }, [dispatch])

  useEffect(() => {
    if (points) {
      setFormData(points)
    }
  }, [points])

  useEffect(() => {
    if (success) {
      toast.success(success)
      dispatch(clearMessages())
    }
    if (error) {
      toast.error(typeof error === 'string' ? error : 'An error occurred')
      dispatch(clearMessages())
    }
  }, [success, error, dispatch])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: parseInt(value) || 0
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(updatePoints(formData))
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData(points)
    setIsEditing(false)
    dispatch(clearMessages())
  }

  const pointFields = [
    { key: 'members', label: 'Members', icon: '👥' },
    { key: 'guides', label: 'Guides', icon: '📚' },
    { key: 'farmersHelped', label: 'Farmers Helped', icon: '👨‍🌾' },
    { key: 'expertAdvisors', label: 'Expert Advisors', icon: '🎓' },
    { key: 'success', label: 'Success Stories', icon: '⭐' },
    { key: 'localFarmersSupport', label: 'Local Farmers Support', icon: '🤝' },
    { key: 'localCommunity', label: 'Local Community', icon: '🏘️' },
    { key: 'localSources', label: 'Local Sources', icon: '🌱' },
  ]

  return (
    <div className=" bg-green-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 lg:mb-8">
          <div className="w-full lg:w-auto">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Awareness Points Dashboard</h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Manage and track your community engagement metrics</p>
          </div>
          
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-[#236F21] text-white px-4 py-2 rounded-lg hover:bg-[#1B5C1A] transition-colors flex items-center gap-2 justify-center shadow-sm w-full lg:w-auto"
            >
              <Edit size={20} />
              <span className="text-sm sm:text-base">Edit Points</span>
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <button
                onClick={handleCancel}
                className="px-4 sm:px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors border border-gray-300 rounded-lg hover:border-gray-400 flex items-center gap-2 justify-center w-full sm:w-auto"
              >
                <X size={20} />
                <span className="text-sm sm:text-base">Cancel</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={loader}
                className="bg-[#236F21] text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-[#1B5C1A] disabled:opacity-50 transition-colors flex items-center gap-2 justify-center shadow-sm w-full sm:w-auto"
              >
                {loader ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    <span className="text-sm sm:text-base">Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    <span className="text-sm sm:text-base">Save Changes</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Points Cards */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Community Metrics
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Real-time statistics of community engagement
            </p>
          </div>

          <div className="p-4">
            {loader && !isEditing ? (
              <div className="flex justify-center items-center py-12">
                <Loader className="animate-spin text-[#236F21]" size={40} />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {pointFields.map((field) => (
                  <div 
                    key={field.key} 
                    className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-4"
                  >
                    {/* Icon and Input/Value Row */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">{field.icon}</span>
                      {isEditing && (
                        <div className="w-20">
                          <input
                            type="number"
                            name={field.key}
                            value={formData[field.key]}
                            onChange={handleInputChange}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#236F21] focus:ring-[#236F21] text-sm py-2 px-3 text-center"
                            min="0"
                          />
                        </div>
                      )}
                    </div>
                    
                    {/* Label */}
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      {field.label}
                    </h3>
                    
                    {/* Value Display */}
                    {!isEditing && (
                      <p className="text-2xl font-bold text-[#236F21]">
                        {points?.[field.key]?.toLocaleString() || 0}
                      </p>
                    )}
                    
                    {/* Status Info */}
                    {!isEditing && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                          Updated metrics
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              About Community Metrics
            </h3>
            <p className="text-gray-600 text-sm sm:text-base max-w-3xl mx-auto">
              These metrics represent the impact and reach of our community initiatives. 
              Keep them updated to showcase the growth and success of our programs.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Points