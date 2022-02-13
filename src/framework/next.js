
export function next(obj, path, modifier) {
    let result = obj.clone();
    let current = result;

    for (let i = 0; i < path.length; i++) {
        const pathValue = path[i];
        let property = current[pathValue];
                
        current[pathValue] = Array.isArray(property) ? [...property] : property.clone();
        
        current = property;
    }

    modifier(current);
    
    return result;
}

