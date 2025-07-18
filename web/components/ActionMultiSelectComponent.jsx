/**
 * MultiSelectComponent
 * 
 * This component is a customizable multi-select dropdown built using Shopify's Polaris library. 
 * It allows users to search and select multiple options from a list, with the ability to select all options at once.
 * Selected options are displayed as removable tags, and the component supports dynamic filtering as the user types.
 * 
 * @param {string} fieldName - The name of the field associated with this multi-select component, used for identification in form handling.
 * @param {string} labelName - The label for the field, used in the placeholder and other descriptive text.
 * @param {array} selectOptions - An array of strings representing the available options to select from.
 * @param {function} onValueChange - Callback function that is triggered when the selection changes. It receives the updated list of selected options and the fieldName.
 * @param {array} [defaultValue] - An optional array of strings representing the default selected options.
 * 
 * @returns {JSX.Element} A multi-select dropdown component with tagging functionality and a searchable list.
 */

import {
    InlineStack,
    Tag,
    Listbox,
    EmptySearchResult,
    Combobox,
    Text,
    AutoSelection,
    BlockStack
} from '@shopify/polaris';
import { useState, useCallback, useMemo, useEffect } from 'react';
import TextComponent from './TextComponent';

const MultiSelectComponent = ({ fieldName, labelName, selectOptions, onValueChange, defaultValue }) => {
    const [selectedTags, setSelectedTags] = useState([]);
    const [value, setValue] = useState('');
    const [suggestion, setSuggestion] = useState('');

    // Function to get all tags, including "Select All" option, ensuring it is always at the top.
    const getAllTags = useCallback(() => {
        const allOptions = ['Select All', ...selectOptions];
        return [...new Set([...allOptions, ...selectedTags].sort((a, b) => {
            if (a === 'Select All') return -1;
            if (b === 'Select All') return 1;
            return 0;
        }))];
    }, [selectedTags, selectOptions]);
    
    // Handle changes to the active option in the listbox.
    const handleActiveOptionChange = useCallback(
        (activeOption) => {
            const activeOptionIsAction = activeOption === value;

            if (!activeOptionIsAction && !selectedTags.includes(activeOption)) {
                setSuggestion(activeOption);
            } else {
                setSuggestion('');
            }
        },
        [value, selectedTags],
    );

    // Update the selection when an option is selected or deselected.
    const updateSelection = useCallback(
        (selected) => {
            let nextSelectedTags = new Set([...selectedTags]);
    
            if (selected === 'Select All') {
                if (selectedTags.includes('Select All')) {
                    nextSelectedTags.clear();
                } else {
                    nextSelectedTags = new Set(selectOptions);
                    nextSelectedTags.add('Select All');
                }
            } else {
                if (nextSelectedTags.has(selected)) {
                    nextSelectedTags.delete(selected);
                    nextSelectedTags.delete('Select All'); // Deselect "Select All" if any option is deselected
                } else {
                    nextSelectedTags.add(selected);
                }
    
                // Automatically select "Select All" if all options are selected manually
                if (nextSelectedTags.size === selectOptions.length) {
                    nextSelectedTags.add('Select All');
                }
            }
    
            setSelectedTags([...nextSelectedTags]);
            onValueChange([...nextSelectedTags], fieldName);
            setValue('');
            setSuggestion('');
        },
        [selectedTags, selectOptions, fieldName, onValueChange],
    );
    
    // Remove a tag from the selection.
    const removeTag = useCallback(
        (tag) => () => {
            updateSelection(tag);
        },
        [updateSelection],
    );

    // Format the display text for options, highlighting matching text.
    const formatOptionText = useCallback(
        (option) => {
            const trimValue = value.trim().toLocaleLowerCase();
            const matchIndex = option.toLocaleLowerCase().indexOf(trimValue);

            if (!value || matchIndex === -1) return option;

            const start = option.slice(0, matchIndex);
            const highlight = option.slice(matchIndex, matchIndex + trimValue.length);
            const end = option.slice(matchIndex + trimValue.length, option.length);

            return (
                <p>
                    {start}
                    <Text fontWeight="bold" as="span">
                        {highlight}
                    </Text>
                    {end}
                </p>
            );
        },
        [value],
    );

    // Escape special characters in the search value to safely use it in a regex.
    const escapeSpecialRegExCharacters = useCallback(
        (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        [],
    );

    // Generate the list of options based on the current search value.
    const options = useMemo(() => {
        let list;
        const allTags = getAllTags();
        const filterRegex = new RegExp(escapeSpecialRegExCharacters(value), 'i');

        if (value) {
            list = allTags.filter((tag) => tag.match(filterRegex));
        } else {
            list = allTags;
        }

        return [...list];
    }, [value, getAllTags, escapeSpecialRegExCharacters]);

    // Markup for displaying selected tags.
    const verticalContentMarkup =
        selectedTags.length > 0 ? (
            <InlineStack spacing="extraTight" alignment="center" gap="200">
                {selectedTags.map((tag) => (
                    <Tag key={`option-${tag}`} onRemove={removeTag(tag)}>
                        {tag}
                    </Tag>
                ))}
            </InlineStack>
        ) : null;

    // Markup for displaying the list of options in the dropdown.
    const optionMarkup =
        options.length > 0
            ? options.map((option) => {
                return (
                    <Listbox.Option
                        key={option}
                        value={option}
                        selected={selectedTags.includes(option)}
                        accessibilityLabel={option}
                    >
                        <Listbox.TextOption selected={selectedTags.includes(option)}>
                            {formatOptionText(option)}
                        </Listbox.TextOption>
                    </Listbox.Option>
                );
            })
            : null;

    // Display an empty state if no matching options are found.
    const emptyStateMarkup = optionMarkup ? null : (
        <EmptySearchResult
            title=""
            description={`No tags found matching "${value}"`}
        />
    );

    // The full listbox markup, combining options and empty state.
    const listboxMarkup =
        optionMarkup || emptyStateMarkup ? (
            <Listbox
                autoSelection={AutoSelection.None}
                onSelect={updateSelection}
                onActiveOptionChange={handleActiveOptionChange}
            >
                {optionMarkup}
            </Listbox>
        ) : null;

    // Effect to handle setting default values on component mount.
    useEffect(() => {
        if (defaultValue) {
            const defaultSet = new Set(defaultValue);
            // Add "Select All" if all options are selected by default
            if (defaultValue.length === selectOptions.length) {
                defaultSet.add('Select All');
            }
            setSelectedTags([...defaultSet]);
        }
    }, [defaultValue, selectOptions]);

    return (
        <BlockStack gap="150">
            <TextComponent
                textTitle={labelName}
                textVariant="bodyMd"
                textAs="span"
            />
            <Combobox
                allowMultiple
                activator={
                    <Combobox.TextField
                        autoComplete="off"
                        labelHidden
                        suggestion={suggestion}
                        placeholder={`Search ${labelName}`}
                        verticalContent={verticalContentMarkup}
                        value={value}
                        onChange={setValue}
                    />
                }
            >
                {listboxMarkup}
            </Combobox>
        </BlockStack>
    );
}

export default MultiSelectComponent;