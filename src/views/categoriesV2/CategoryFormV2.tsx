import { useEffect, useMemo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { categorySchema, defaultCategoryValues, type CategoryFormInput } from './schema/categorySchema'
import { formToApiData, validateFormForSubmission, getCategoryLevel } from './utils/dataTransform'
import useCategories from './hooks/useCategories'
import { useNavigate } from 'react-router-dom'

import Card from '@/components/ui/Card'
import Tabs from '@/components/ui/Tabs'
import Tag from '@/components/ui/Tag'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import Switcher from '@/components/ui/Switcher'
import { FormContainer, FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import CategoryPreview from './components/CategoryPreview'
import AttributesEditor from './components/AttributesEditor'

type Props = { 
    initial?: CategoryFormInput
    onSaved?: (c: CategoryFormInput) => void
    headerTitle?: string 
}

export default function CategoryFormV2({ initial, onSaved, headerTitle }: Props) {
    const navigate = useNavigate()
    const [isDirtySinceMount, setIsDirtySinceMount] = useState(false)
    const [validationErrors, setValidationErrors] = useState<string[]>([])
    const [selectedLevel, setSelectedLevel] = useState<number>(1)
    
    // Redux hooks
    const { 
        createCategory, 
        updateCategory, 
        isCreating, 
        isUpdating, 
        error,
        parentCategories,
        loadParentCategories,
        isParentCategoriesLoading
    } = useCategories()
    
    const {
        control,
        register,
        handleSubmit,
        formState: { errors, isDirty, isSubmitting },
        reset,
        watch,
        setValue,
        setError,
        clearErrors
    } = useForm<CategoryFormInput>({
        resolver: zodResolver(categorySchema),
        defaultValues: initial ?? defaultCategoryValues,
        mode: 'onChange',
    })

    const [hasInitialized, setHasInitialized] = useState(false)
    const [lastInitialId, setLastInitialId] = useState<string | null>(null)

    useEffect(() => {
        const subscription = watch(() => setIsDirtySinceMount(true))
        return () => subscription.unsubscribe()
    }, [watch])

    useEffect(() => {
        // Reset initialization flag if we're editing a different category
        if (initial?.id && initial.id !== lastInitialId) {
            setHasInitialized(false)
            setLastInitialId(initial.id)
        }
        
        // Only reset the form once when initial data is first provided
        if (initial && !hasInitialized) {
            console.log('🔄 CategoryForm - Initializing form with data:', initial)
            reset(initial)
            setHasInitialized(true)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initial, hasInitialized, lastInitialId])

    // Load parent categories when component mounts and when level changes
    useEffect(() => {
        // Always load parent categories on mount so they're available for any level
        loadParentCategories(1) // Load all categories
    }, [loadParentCategories])

    // Update parentId when level changes
    useEffect(() => {
        if (selectedLevel === 1) {
            setValue('parentId', null, { shouldDirty: true })
        }
    }, [selectedLevel, setValue])

    const form = watch()
    const isLoading = isCreating || isUpdating

    // Filter parent categories based on selected level
    const availableParents = useMemo(() => {
        if (selectedLevel === 1) return []
        if (selectedLevel === 2) {
            // For level 2, show level 1 categories
            return parentCategories.filter(cat => cat.level === 1)
        }
        if (selectedLevel === 3) {
            // For level 3, show level 2 categories
            return parentCategories.filter(cat => cat.level === 2)
        }
        if (selectedLevel === 4) {
            // For level 4, show level 3 categories
            return parentCategories.filter(cat => cat.level === 3)
        }
        if (selectedLevel === 5) {
            // For level 5, show level 4 categories
            return parentCategories.filter(cat => cat.level === 4)
        }
        return []
    }, [parentCategories, selectedLevel])

    async function onSubmit(values: CategoryFormInput, shouldPublish = false) {
        try {
            console.log('🚀 CategoryForm - Form submission started')
            console.log('📋 CategoryForm - Form values:', values)
            console.log('🔍 CategoryForm - values.id:', values.id)
            console.log('🔍 CategoryForm - initial data:', initial)
            
            // Clear previous validation errors
            setValidationErrors([])
            clearErrors()

            // Additional validation for parent selection
            if (selectedLevel > 1 && !values.parentId) {
                setValidationErrors([`Parent category is required for Level ${selectedLevel} categories`])
                return
            }

            // Validate form data
            const formValidation = validateFormForSubmission(values)
            if (!formValidation.isValid) {
                setValidationErrors(formValidation.errors)
                return
            }

            // Transform form data to API format
            const apiData = formToApiData(values)
            console.log('📦 CategoryForm - API data prepared:', apiData)

            // Save category
            if (values.id) {
                console.log('🔄 CategoryForm - Updating existing category with ID:', values.id)
                await updateCategory(values.id, apiData)
            } else {
                console.log('✨ CategoryForm - Creating new category')
                await createCategory(apiData)
            }

            console.log('✅ CategoryForm - Category saved successfully')

            // Success callback
            onSaved?.(values)
            setIsDirtySinceMount(false)

            // Navigate back to list or stay for further editing
            if (shouldPublish) {
                navigate('/app/categories-v2/category-list')
            }
        } catch (error) {
            console.error('💥 CategoryForm - Save failed:', error)
            setValidationErrors([error instanceof Error ? error.message : 'Failed to save category'])
        }
    }

    const slug = useMemo(() => 
        (form.name || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''), 
        [form.name]
    )

    return (
        <div className="space-y-4">
            {/* Error Messages */}
            {(validationErrors.length > 0 || error) && (
                <Alert 
                    showIcon 
                    className="mb-4" 
                    type="danger"
                    onClose={() => {
                        setValidationErrors([])
                    }}
                >
                    <div>
                        {error && <div className="mb-2">{error}</div>}
                        {validationErrors.map((err, idx) => (
                            <div key={idx} className="mb-1">• {err}</div>
                        ))}
                    </div>
                </Alert>
            )}

            {/* Sticky Header */}
            <Card className="sticky top-0 z-10" bodyClass="py-3 px-4 md:px-6 lg:px-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{headerTitle ?? 'New Category'}</h3>
                        {isDirtySinceMount && (
                            <Tag className="bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded" suffix suffixClass="bg-red-500" aria-label="Unsaved changes">
                                Unsaved
                            </Tag>
                        )}
                        {isLoading && (
                            <Tag className="bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded">
                                Saving...
                            </Tag>
                        )}
                        <Tag className="bg-green-100 text-green-800 border border-green-200 px-2 py-0.5 rounded">
                            Level {selectedLevel}
                        </Tag>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button 
                            type="button" 
                            onClick={() => {
                                reset()
                                setValidationErrors([])
                            }} 
                            disabled={!isDirty || isLoading}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="button" 
                            onClick={handleSubmit((v) => onSubmit(v, false))} 
                            disabled={!isDirty || isLoading}
                            loading={isLoading}
                        >
                            Save Draft
                        </Button>
                        <Button 
                            type="button" 
                            variant="solid" 
                            onClick={handleSubmit((v) => onSubmit(v, true))} 
                            disabled={isLoading}
                            loading={isLoading}
                        >
                            Save & Publish
                        </Button>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-4">
                    <Card className="p-2 md:p-3">
                        <Tabs defaultValue="basics" variant="pill">
                            <Tabs.TabList>
                                <Tabs.TabNav value="basics">Basics</Tabs.TabNav>
                                <Tabs.TabNav value="hierarchy">Hierarchy</Tabs.TabNav>
                                <Tabs.TabNav value="attributes">Attributes</Tabs.TabNav>
                                <Tabs.TabNav value="preview">Preview</Tabs.TabNav>
                            </Tabs.TabList>

                            <Tabs.TabContent value="basics" className="p-4 space-y-4">
                                <FormContainer>
                                    <FormItem 
                                        label="Category Name" 
                                        invalid={!!errors.name} 
                                        errorMessage={errors.name?.message}
                                    >
                                        <Input autoFocus {...register('name')} placeholder="Electronics" />
                                    </FormItem>

                                    <FormItem 
                                        label="Display Order" 
                                        invalid={!!errors.displayOrder} 
                                        errorMessage={errors.displayOrder?.message}
                                    >
                                        <Input 
                                            type="number" 
                                            min="1" 
                                            {...register('displayOrder', { valueAsNumber: true })} 
                                            placeholder="1" 
                                        />
                                    </FormItem>

                                    <FormItem label="Active Status">
                                        <Controller
                                            name="isActive"
                                            control={control}
                                            render={({ field }) => (
                                                <Switcher 
                                                    checked={field.value} 
                                                    onChange={field.onChange} 
                                                />
                                            )}
                                        />
                                    </FormItem>

                                    <div className="text-xs text-gray-500">
                                        Slug preview: {slug || '—'}
                                    </div>
                                </FormContainer>
                            </Tabs.TabContent>

                            <Tabs.TabContent value="hierarchy" className="p-4 space-y-4">
                                <FormContainer>
                                    <FormItem label="Category Level">
                                        <select 
                                            className="input"
                                            value={selectedLevel.toString()}
                                            onChange={(e) => {
                                                const level = parseInt(e.target.value)
                                                setSelectedLevel(level)
                                                if (level === 1) {
                                                    setValue('parentId', null, { shouldDirty: true })
                                                }
                                            }}
                                        >
                                            <option value="1">Level 1 (Root Category)</option>
                                            <option value="2">Level 2 (Subcategory)</option>
                                            <option value="3">Level 3 (Sub-subcategory)</option>
                                            <option value="4">Level 4 (Sub-sub-subcategory)</option>
                                            <option value="5">Level 5 (Sub-sub-sub-subcategory)</option>
                                        </select>
                                    </FormItem>

                                    {selectedLevel > 1 && (
                                        <FormItem 
                                            label="Parent Category" 
                                            invalid={!!errors.parentId || (selectedLevel > 1 && !form.parentId)} 
                                            errorMessage={errors.parentId?.message || (selectedLevel > 1 && !form.parentId ? 'Parent category is required' : '')}
                                        >
                                            <select
                                                className="input"
                                                {...register('parentId')}
                                                disabled={isParentCategoriesLoading || availableParents.length === 0}
                                            >
                                                <option value="">
                                                    {isParentCategoriesLoading ? "Loading..." : "Select parent category"}
                                                </option>
                                                {availableParents.map((parent) => (
                                                    <option key={parent.id} value={parent.id}>
                                                        {'  '.repeat(parent.level - 1)}{parent.name} (Level {parent.level})
                                                    </option>
                                                ))}
                                            </select>
                                        </FormItem>
                                    )}

                                    {availableParents.length === 0 && selectedLevel > 1 && !isParentCategoriesLoading && (
                                        <Alert type="warning" className="mt-2">
                                            No parent categories available for Level {selectedLevel}. Please create Level {selectedLevel - 1} categories first.
                                        </Alert>
                                    )}
                                </FormContainer>
                            </Tabs.TabContent>

                            <Tabs.TabContent value="attributes" className="p-4 space-y-4">
                                <AttributesEditor
                                    value={form.attributes}
                                    onChange={(attributes) => setValue('attributes', attributes, { shouldDirty: true })}
                                />
                            </Tabs.TabContent>

                            <Tabs.TabContent value="preview" className="p-4">
                                <div className="prose dark:prose-invert max-w-none">
                                    <h4>Category JSON</h4>
                                    <pre className="whitespace-pre-wrap break-all text-xs">{JSON.stringify(form, null, 2)}</pre>
                                </div>
                            </Tabs.TabContent>
                        </Tabs>
                    </Card>
                </div>
                <div className="lg:col-span-1">
                    <CategoryPreview form={form} selectedLevel={selectedLevel} />
                </div>
            </div>
        </div>
    )
}
