/// <reference types="mongoose" />
import { SchemaType } from 'mongoose';
export declare type Func = (...args: any[]) => any;
export declare type RequiredType = boolean | [boolean, string] | string | Func | [Func, string];
export interface SyncValidationOption {
    validator: (v: any) => boolean;
}
export interface PromiseValidationOption {
    validator: (v: any) => Promise<boolean>;
}
export interface BasePropOptions {
    required?: RequiredType;
    enum?: string[] | object;
    default?: any;
    unique?: boolean;
    index?: boolean;
    sparse?: boolean;
    expires?: string | number;
    get?: (val: any, schemaType?: SchemaType) => any;
    set?: (val: any, schemaType?: SchemaType) => any;
    validate?: RegExp | [RegExp, string] | SyncValidationOption | PromiseValidationOption;
}
export interface PropOptions extends BasePropOptions {
    ref?: any;
}
export interface ValidateNumberOptions {
    min?: number | [number, string];
    max?: number | [number, string];
}
export interface ValidateStringOptions {
    minlength?: number | [number, string];
    maxlength?: number | [number, string];
    match?: RegExp | [RegExp, string];
}
export declare type PropOptionsWithNumberValidate = PropOptions & ValidateNumberOptions;
export declare type PropOptionsWithStringValidate = PropOptions & ValidateStringOptions;
export declare type PropOptionsWithValidate = PropOptionsWithNumberValidate | PropOptionsWithStringValidate;
export declare const prop: (options?: PropOptionsWithValidate) => (target: any, key: string) => void;
export interface ArrayPropOptions extends BasePropOptions {
    items?: any;
    itemsRef?: any;
}
export declare const arrayProp: (options: ArrayPropOptions) => (target: any, key: string) => void;
export declare type Ref<T> = T | string;
